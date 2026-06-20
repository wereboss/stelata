from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_redirect():
    """
    Test that requesting the root path redirects the client to the SPA index page.
    """
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/static/index.html"

def test_static_index_html():
    """
    Test that the index.html page is served correctly with correct HTML tags.
    """
    response = client.get("/static/index.html")
    assert response.status_code == 200
    assert "Space Cadet Keyboard" in response.text
    assert "<canvas" in response.text

def test_static_styles_css():
    """
    Test that the stylesheet CSS is served correctly.
    """
    response = client.get("/static/styles.css")
    assert response.status_code == 200
    assert "--neon-blue" in response.text
    assert "body" in response.text

def test_static_app_js():
    """
    Test that the frontend JavaScript application is served correctly.
    """
    response = client.get("/static/app.js")
    assert response.status_code == 200
    assert "SpaceAudioSynth" in response.text
    assert "floatingLetters" in response.text
