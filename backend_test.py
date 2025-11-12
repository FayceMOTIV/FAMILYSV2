#!/usr/bin/env python3
"""
Backend API Testing for Family's Back Office AI Assistant
Tests CORS fix and AI integration endpoints
"""

import asyncio
import aiohttp
import json
import sys
from typing import Dict, Optional

# Backend URL from environment
BACKEND_URL = "https://resto-backoffice-1.preview.emergentagent.com"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = None
        self.auth_token = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_result(self, test_name: str, success: bool, message: str, response_data: Optional[Dict] = None):
        """Log test result."""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        })
        
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    async def test_login(self) -> bool:
        """Test admin login endpoint."""
        test_name = "Admin Login"
        
        try:
            login_data = {
                "email": "admin@familys.app",
                "password": "Admin@123456"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if "access_token" in data:
                        self.auth_token = data["access_token"]
                        self.log_result(test_name, True, f"Login successful, token received")
                        return True
                    else:
                        self.log_result(test_name, False, "No access token in response", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_ai_chat(self) -> bool:
        """Test AI chat endpoint."""
        test_name = "AI Chat"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
        
        try:
            chat_data = {
                "question": "Bonjour, comment ça va?"
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/ai/chat",
                json=chat_data,
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if "response" in data and data["response"]:
                        self.log_result(test_name, True, f"AI responded: {data['response'][:100]}...")
                        return True
                    else:
                        self.log_result(test_name, False, "No AI response in data", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_marketing_generation(self) -> bool:
        """Test marketing generation endpoint."""
        test_name = "Marketing Generation"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
        
        try:
            marketing_data = {
                "type": "social_post"
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/ai/generate-marketing",
                json=marketing_data,
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if "generated_text" in data and data["generated_text"]:
                        self.log_result(test_name, True, f"Marketing text generated: {data['generated_text'][:100]}...")
                        return True
                    else:
                        self.log_result(test_name, False, "No generated text in response", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_sales_analysis(self) -> bool:
        """Test sales analysis endpoint."""
        test_name = "Sales Analysis"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/ai/analyze-sales",
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if "ai_analysis" in data or "message" in data:
                        if "message" in data:
                            self.log_result(test_name, True, f"Analysis result: {data['message']}")
                        else:
                            self.log_result(test_name, True, f"Sales analysis completed with AI insights")
                        return True
                    else:
                        self.log_result(test_name, False, "No analysis data in response", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_promo_suggestion(self) -> bool:
        """Test promo suggestion endpoint."""
        test_name = "Promo Suggestion"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/ai/suggest-promo",
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if "suggestion" in data and data["suggestion"]:
                        self.log_result(test_name, True, f"Promo suggestion generated successfully")
                        return True
                    else:
                        self.log_result(test_name, False, "No suggestion in response", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_cors_headers(self) -> bool:
        """Test CORS headers are present."""
        test_name = "CORS Headers"
        
        try:
            # Test preflight request
            headers = {
                "Origin": "https://resto-backoffice-1.preview.emergentagent.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "authorization,content-type"
            }
            
            async with self.session.options(
                f"{self.base_url}/api/v1/admin/auth/login",
                headers=headers
            ) as response:
                
                cors_headers = {
                    "access-control-allow-origin": response.headers.get("access-control-allow-origin"),
                    "access-control-allow-methods": response.headers.get("access-control-allow-methods"),
                    "access-control-allow-headers": response.headers.get("access-control-allow-headers"),
                    "access-control-allow-credentials": response.headers.get("access-control-allow-credentials")
                }
                
                if any(cors_headers.values()):
                    self.log_result(test_name, True, f"CORS headers present: {cors_headers}")
                    return True
                else:
                    self.log_result(test_name, False, f"No CORS headers found. Response headers: {dict(response.headers)}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def run_all_tests(self):
        """Run all backend tests."""
        print(f"🚀 Starting Backend API Tests for: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("CORS Headers", self.test_cors_headers),
            ("Admin Login", self.test_login),
            ("AI Chat", self.test_ai_chat),
            ("Marketing Generation", self.test_marketing_generation),
            ("Sales Analysis", self.test_sales_analysis),
            ("Promo Suggestion", self.test_promo_suggestion),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                result = await test_func()
                if result:
                    passed += 1
            except Exception as e:
                self.log_result(test_name, False, f"Test execution failed: {str(e)}")
        
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests PASSED!")
            return True
        else:
            print(f"⚠️  {total - passed} tests FAILED")
            return False

async def main():
    """Main test runner."""
    async with BackendTester() as tester:
        success = await tester.run_all_tests()
        return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)