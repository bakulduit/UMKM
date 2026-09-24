"""Backend integration tests for UMKM Pay multi-tenant SaaS."""
import os
import io
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or \
           open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split("\n")[0].strip()
API = f"{BASE_URL}/api"

SUPER_ADMIN = {"email": "nashoharizal@gmail.com", "password": "Superadmin123"}

# Fresh UMKM per session
RUN_ID = uuid.uuid4().hex[:8]
UMKM_A = {"name": "Owner A", "business_name": f"Toko A {RUN_ID}", "email": f"toko_a_{RUN_ID}@demo.com", "password": "Toko123", "phone": "08111"}
UMKM_B = {"name": "Owner B", "business_name": f"Toko B {RUN_ID}", "email": f"toko_b_{RUN_ID}@demo.com", "password": "Toko123", "phone": "08222"}


def _auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def super_token():
    r = requests.post(f"{API}/auth/login", json=SUPER_ADMIN, timeout=15)
    assert r.status_code == 200, f"super admin login: {r.status_code} {r.text}"
    data = r.json()
    assert data["user"]["role"] == "super_admin"
    return data["access_token"]


@pytest.fixture(scope="session")
def umkm_a():
    r = requests.post(f"{API}/auth/register", json=UMKM_A, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["user"]["role"] == "umkm_admin"
    return data


@pytest.fixture(scope="session")
def umkm_b():
    r = requests.post(f"{API}/auth/register", json=UMKM_B, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()


@pytest.fixture(scope="session")
def token_a(umkm_a):
    return umkm_a["access_token"]


@pytest.fixture(scope="session")
def token_b(umkm_b):
    return umkm_b["access_token"]


# ================= AUTH =================
class TestAuth:
    def test_super_admin_login(self, super_token):
        assert super_token

    def test_register_and_trial(self, umkm_a):
        r = requests.get(f"{API}/auth/me", headers=_auth_headers(umkm_a["access_token"]))
        assert r.status_code == 200
        me = r.json()
        assert me["role"] == "umkm_admin"
        assert me["umkm"]["status"] == "trial"
        assert me["subscription"]["active"] is True

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": SUPER_ADMIN["email"], "password": "wrong"})
        assert r.status_code == 401

    def test_me_no_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401


# ================= ADMIN =================
class TestSuperAdmin:
    def test_admin_stats(self, super_token):
        r = requests.get(f"{API}/admin/stats", headers=_auth_headers(super_token))
        assert r.status_code == 200
        data = r.json()
        for k in ("total_umkm", "active_umkm", "pending_payments", "total_revenue"):
            assert k in data

    def test_list_umkms(self, super_token, umkm_a):
        r = requests.get(f"{API}/admin/umkms", headers=_auth_headers(super_token))
        assert r.status_code == 200
        umkms = r.json()
        assert any(u["id"] == umkm_a["user"]["umkm_id"] for u in umkms)

    def test_umkm_cannot_access_admin(self, token_a):
        r = requests.get(f"{API}/admin/stats", headers=_auth_headers(token_a))
        assert r.status_code == 403


# ================= PRODUCTS =================
@pytest.fixture(scope="session")
def product_a(token_a):
    payload = {"name": "Kopi Susu", "sku": "K01", "category": "Minuman", "price": 15000,
               "cost": 8000, "stock": 50, "low_stock_threshold": 5}
    r = requests.post(f"{API}/products", json=payload, headers=_auth_headers(token_a))
    assert r.status_code == 200, r.text
    return r.json()


class TestProducts:
    def test_create_product(self, product_a):
        assert product_a["name"] == "Kopi Susu"
        assert product_a["stock"] == 50
        assert "id" in product_a

    def test_list_products(self, token_a, product_a):
        r = requests.get(f"{API}/products", headers=_auth_headers(token_a))
        assert r.status_code == 200
        prods = r.json()
        assert any(p["id"] == product_a["id"] for p in prods)

    def test_tenant_isolation(self, token_b, product_a):
        r = requests.get(f"{API}/products", headers=_auth_headers(token_b))
        assert r.status_code == 200
        assert all(p["id"] != product_a["id"] for p in r.json())


# ================= TRANSACTIONS =================
class TestTransactions:
    def test_cash_sale_decrements_stock(self, token_a, product_a):
        payload = {"items": [{"product_id": product_a["id"], "name": product_a["name"],
                              "price": product_a["price"], "cost": product_a["cost"], "qty": 2}],
                   "payment_method": "cash", "tax_rate": 0, "discount": 0}
        r = requests.post(f"{API}/transactions/sale", json=payload, headers=_auth_headers(token_a))
        assert r.status_code == 200, r.text
        sale = r.json()
        assert sale["total"] == 30000
        assert sale["status"] == "paid"
        # check stock decremented
        r2 = requests.get(f"{API}/products", headers=_auth_headers(token_a))
        prod = next(p for p in r2.json() if p["id"] == product_a["id"])
        assert prod["stock"] == 48

    def test_qris_sale(self, token_a, product_a):
        payload = {"items": [{"product_id": product_a["id"], "name": product_a["name"],
                              "price": product_a["price"], "cost": product_a["cost"], "qty": 1}],
                   "payment_method": "qris"}
        r = requests.post(f"{API}/transactions/sale", json=payload, headers=_auth_headers(token_a))
        assert r.status_code == 200
        assert r.json()["payment_method"] == "qris"

    def test_kasbon_sale_increases_customer_balance(self, token_a, product_a):
        # create customer
        rc = requests.post(f"{API}/customers", json={"name": "Budi", "phone": "081"},
                           headers=_auth_headers(token_a))
        assert rc.status_code == 200
        cust = rc.json()
        payload = {"items": [{"product_id": product_a["id"], "name": product_a["name"],
                              "price": product_a["price"], "cost": product_a["cost"], "qty": 2}],
                   "payment_method": "cash", "customer_id": cust["id"], "is_credit": True}
        r = requests.post(f"{API}/transactions/sale", json=payload, headers=_auth_headers(token_a))
        assert r.status_code == 200
        sale = r.json()
        assert sale["is_credit"] is True
        assert sale["status"] == "credit"
        # verify customer balance
        r2 = requests.get(f"{API}/customers", headers=_auth_headers(token_a))
        c = next(c for c in r2.json() if c["id"] == cust["id"])
        assert c["balance"] == 30000
        # pay partial
        rp = requests.post(f"{API}/customers/{cust['id']}/pay?amount=10000",
                           headers=_auth_headers(token_a))
        assert rp.status_code == 200
        assert rp.json()["balance"] == 20000

    def test_create_expense(self, token_a):
        r = requests.post(f"{API}/transactions/expense",
                          json={"category": "Sewa", "amount": 500000, "note": "bulan ini"},
                          headers=_auth_headers(token_a))
        assert r.status_code == 200
        assert r.json()["total"] == 500000
        assert r.json()["type"] == "expense"


# ================= DASHBOARD & REPORTS =================
@pytest.fixture(scope="class")
def _seed_class_data(token_a, product_a):
    # Seed a sale and expense within this class/worker so dashboard/reports have data
    payload = {"items": [{"product_id": product_a["id"], "name": product_a["name"],
                          "price": product_a["price"], "cost": product_a["cost"], "qty": 3}],
               "payment_method": "cash"}
    requests.post(f"{API}/transactions/sale", json=payload, headers=_auth_headers(token_a))
    requests.post(f"{API}/transactions/sale", json={**payload, "payment_method": "qris",
                                                    "items": [{"product_id": product_a["id"], "name": product_a["name"],
                                                               "price": product_a["price"], "cost": product_a["cost"], "qty": 1}]},
                  headers=_auth_headers(token_a))
    requests.post(f"{API}/transactions/expense",
                  json={"category": "Sewa", "amount": 500000},
                  headers=_auth_headers(token_a))
    return True


@pytest.mark.usefixtures("_seed_class_data")
class TestDashboardReports:
    def test_dashboard_summary(self, token_a):
        r = requests.get(f"{API}/dashboard/summary", headers=_auth_headers(token_a))
        assert r.status_code == 200
        data = r.json()
        for k in ("income", "expense", "profit", "series", "top_products", "low_stock", "receivables"):
            assert k in data
        assert data["income"] >= 45000  # cash + qris sales
        assert data["expense"] >= 500000
        assert len(data["series"]) == 7

    def test_reports_summary(self, token_a):
        r = requests.get(f"{API}/reports/summary", headers=_auth_headers(token_a))
        assert r.status_code == 200
        data = r.json()
        for k in ("revenue", "cogs", "gross_profit", "net_profit", "cash_in", "cash_out", "net_cash_flow"):
            assert k in data
        assert data["revenue"] > 0
        assert data["total_expense"] >= 500000

    def test_export_excel(self, token_a):
        r = requests.get(f"{API}/reports/export?format=excel&auth={token_a}")
        assert r.status_code == 200
        assert "spreadsheet" in r.headers.get("content-type", "")
        assert len(r.content) > 100

    def test_export_pdf(self, token_a):
        r = requests.get(f"{API}/reports/export?format=pdf&auth={token_a}")
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("application/pdf")
        assert r.content[:4] == b"%PDF"


# ================= CASHIERS =================
CASHIER_EMAIL = f"kasir_{RUN_ID}@demo.com"


class TestCashier:
    def test_create_cashier(self, token_a):
        r = requests.post(f"{API}/cashiers",
                          json={"name": "Kasir 1", "email": CASHIER_EMAIL, "password": "Kasir123"},
                          headers=_auth_headers(token_a))
        assert r.status_code == 200
        assert r.json()["role"] == "cashier"

    def test_cashier_login_and_role(self):
        r = requests.post(f"{API}/auth/login", json={"email": CASHIER_EMAIL, "password": "Kasir123"})
        assert r.status_code == 200
        token = r.json()["access_token"]
        # cashier can list products
        assert requests.get(f"{API}/products", headers=_auth_headers(token)).status_code == 200
        # cashier CANNOT create product
        assert requests.post(f"{API}/products", json={"name": "x", "price": 1},
                             headers=_auth_headers(token)).status_code == 403
        # cashier CANNOT access reports
        assert requests.get(f"{API}/reports/summary", headers=_auth_headers(token)).status_code == 403
        # cashier CANNOT create cashier
        assert requests.post(f"{API}/cashiers", json={"name": "x", "email": "y@z.com", "password": "abc"},
                             headers=_auth_headers(token)).status_code == 403
        # cashier CANNOT access admin
        assert requests.get(f"{API}/admin/umkms", headers=_auth_headers(token)).status_code == 403


# ================= OUTLETS =================
class TestOutlets:
    def test_create_and_delete_outlet(self, token_a):
        r = requests.post(f"{API}/outlets", json={"name": "Cabang 2", "address": "Jl. X"},
                          headers=_auth_headers(token_a))
        assert r.status_code == 200
        oid = r.json()["id"]
        r2 = requests.get(f"{API}/outlets", headers=_auth_headers(token_a))
        assert any(o["id"] == oid for o in r2.json())
        r3 = requests.delete(f"{API}/outlets/{oid}", headers=_auth_headers(token_a))
        assert r3.status_code == 200


# ================= UPLOAD & SUBSCRIPTION =================
@pytest.fixture(scope="session")
def uploaded_path(token_a):
    # 1x1 png
    png = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6300010000000500010d0a2db40000000049454e44ae426082")
    files = {"file": ("test.png", io.BytesIO(png), "image/png")}
    r = requests.post(f"{API}/upload", files=files, headers=_auth_headers(token_a))
    assert r.status_code == 200, r.text
    return r.json()["path"]


class TestUploadSubscription:
    def test_upload_returns_path(self, uploaded_path):
        assert uploaded_path and isinstance(uploaded_path, str)

    def test_download_file(self, uploaded_path, token_a):
        r = requests.get(f"{API}/files/{uploaded_path}?auth={token_a}")
        assert r.status_code == 200
        assert len(r.content) > 0

    def test_download_file_no_auth(self, uploaded_path):
        r = requests.get(f"{API}/files/{uploaded_path}")
        assert r.status_code == 401

    def test_subscription_flow(self, token_a, super_token, uploaded_path, umkm_a):
        # get plans
        r = requests.get(f"{API}/subscription/plans")
        assert r.status_code == 200
        assert len(r.json()["plans"]) >= 1
        # submit
        r2 = requests.post(f"{API}/subscription/subscribe",
                           json={"plan_id": "monthly", "proof_path": uploaded_path},
                           headers=_auth_headers(token_a))
        assert r2.status_code == 200
        sub_id = r2.json()["id"]
        assert r2.json()["status"] == "pending"
        # super admin sees pending
        r3 = requests.get(f"{API}/admin/subscriptions?status=pending", headers=_auth_headers(super_token))
        assert r3.status_code == 200
        assert any(s["id"] == sub_id for s in r3.json())
        # approve
        r4 = requests.post(f"{API}/admin/subscriptions/{sub_id}/approve", headers=_auth_headers(super_token))
        assert r4.status_code == 200
        assert "subscription_end" in r4.json()
        # umkm now active
        r5 = requests.get(f"{API}/auth/me", headers=_auth_headers(token_a))
        assert r5.json()["subscription"]["active"] is True

    def test_reject_subscription(self, token_a, super_token, uploaded_path):
        r2 = requests.post(f"{API}/subscription/subscribe",
                           json={"plan_id": "monthly", "proof_path": uploaded_path},
                           headers=_auth_headers(token_a))
        sub_id = r2.json()["id"]
        r4 = requests.post(f"{API}/admin/subscriptions/{sub_id}/reject", headers=_auth_headers(super_token))
        assert r4.status_code == 200


# ================= PLATFORM SETTINGS & TOGGLE =================
class TestPlatformAndToggle:
    def test_update_settings(self, super_token, uploaded_path):
        r = requests.put(f"{API}/admin/settings",
                         json={"qris_image_path": uploaded_path, "business_name": "UMKM Pay", "contact": "0812"},
                         headers=_auth_headers(super_token))
        assert r.status_code == 200
        assert r.json()["qris_image_path"] == uploaded_path

    def test_toggle_umkm_suspend(self, super_token, umkm_b, token_b):
        umkm_id = umkm_b["user"]["umkm_id"]
        r = requests.post(f"{API}/admin/umkms/{umkm_id}/toggle", headers=_auth_headers(super_token))
        assert r.status_code == 200
        assert r.json()["suspended"] is True
        # existing token still valid but user is_active=False; login blocked
        r2 = requests.post(f"{API}/auth/login", json={"email": UMKM_B["email"], "password": UMKM_B["password"]})
        assert r2.status_code == 403
        # unsuspend
        r3 = requests.post(f"{API}/admin/umkms/{umkm_id}/toggle", headers=_auth_headers(super_token))
        assert r3.json()["suspended"] is False
        r4 = requests.post(f"{API}/auth/login", json={"email": UMKM_B["email"], "password": UMKM_B["password"]})
        assert r4.status_code == 200
