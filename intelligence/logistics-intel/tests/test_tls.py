"""Run with python3 -m unittest discover -s tests; no network required."""
import importlib.util
from pathlib import Path
import ssl
import unittest
from unittest.mock import patch
import urllib.error


class ScraperTLSChecks(unittest.TestCase):
    def test_certificate_failure_is_not_bypassed(self):
        for name in ("scrape_seed", "detect_web_tech", "extract_apzi_members"):
            with self.subTest(script=name):
                path = Path(__file__).resolve().parents[1] / "scripts" / f"{name}.py"
                spec = importlib.util.spec_from_file_location(name, path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                failure = urllib.error.URLError(
                    ssl.SSLCertVerificationError("untrusted certificate")
                )
                with patch.object(module.urllib.request, "urlopen", side_effect=failure) as request:
                    with self.assertRaises(urllib.error.URLError):
                        module.fetch("https://example.invalid")
                    request.assert_called_once()
                    context = request.call_args.kwargs["context"]
                    self.assertTrue(context.check_hostname)
                    self.assertEqual(context.verify_mode, ssl.CERT_REQUIRED)
                    self.assertGreaterEqual(context.minimum_version, ssl.TLSVersion.TLSv1_2)


if __name__ == "__main__":
    unittest.main()
