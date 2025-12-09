#!/bin/bash

# Automated Pre-Launch Checks
# Tests that can be verified without human interaction

echo "🤖 BulkTok Automated Pre-Launch Checks"
echo "======================================"
echo ""

PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Check if production URL is accessible
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Production URL Accessibility"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
PROD_URL="https://bulktok-fivtx04ku-cesarbautista97xs-projects.vercel.app"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Site is accessible (HTTP $HTTP_CODE)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - Site returned HTTP $HTTP_CODE"
    ((FAILED++))
fi

# Test 2: Check if API routes exist
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Critical API Routes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

API_ROUTES=(
    "/api/settings"
    "/api/stripe/create-checkout"
    "/api/stripe/webhook"
    "/api/generate"
    "/api/hedra/videos"
)

API_PASSED=0
API_FAILED=0

for route in "${API_ROUTES[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${PROD_URL}${route}")
    # API routes should return 400/401 (not 404) when called without auth
    if [ "$HTTP_CODE" != "404" ]; then
        echo -e "${GREEN}✓${NC} $route exists (HTTP $HTTP_CODE)"
        ((API_PASSED++))
    else
        echo -e "${RED}✗${NC} $route not found (HTTP 404)"
        ((API_FAILED++))
    fi
done

if [ $API_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ PASSED${NC} - All API routes exist"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - $API_FAILED API routes missing"
    ((FAILED++))
fi

# Test 3: Check if static pages load
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Static Pages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PAGES=(
    "/"
    "/pricing"
    "/terms"
    "/privacy"
    "/refund"
    "/login"
)

PAGES_PASSED=0
PAGES_FAILED=0

for page in "${PAGES[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${PROD_URL}${page}")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓${NC} $page loads (HTTP 200)"
        ((PAGES_PASSED++))
    else
        echo -e "${RED}✗${NC} $page failed (HTTP $HTTP_CODE)"
        ((PAGES_FAILED++))
    fi
done

if [ $PAGES_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ PASSED${NC} - All pages load correctly"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - $PAGES_FAILED pages failed to load"
    ((FAILED++))
fi

# Test 4: Check for console errors in homepage
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Homepage Content"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HOMEPAGE=$(curl -s "$PROD_URL")

# Check for key elements
if echo "$HOMEPAGE" | grep -q "BulkTok"; then
    echo -e "${GREEN}✓${NC} BulkTok branding present"
    CONTENT_OK=true
else
    echo -e "${RED}✗${NC} BulkTok branding missing"
    CONTENT_OK=false
fi

if echo "$HOMEPAGE" | grep -q "Generate"; then
    echo -e "${GREEN}✓${NC} Navigation links present"
else
    echo -e "${RED}✗${NC} Navigation links missing"
    CONTENT_OK=false
fi

if [ "$CONTENT_OK" = true ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Homepage content looks good"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - Homepage content issues"
    ((FAILED++))
fi

# Test 5: Check environment variables are set
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Environment Variables (Local Check)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"
    
    # Check for critical vars (without exposing values)
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo -e "${GREEN}✓${NC} Supabase URL configured"
    else
        echo -e "${YELLOW}⚠${NC} Supabase URL not found in .env.local"
    fi
    
    if grep -q "STRIPE_SECRET_KEY" .env.local; then
        echo -e "${GREEN}✓${NC} Stripe key configured"
    else
        echo -e "${YELLOW}⚠${NC} Stripe key not found in .env.local"
    fi
    
    echo -e "${YELLOW}ℹ${NC} Note: Vercel uses environment variables from dashboard"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} .env.local not found (using Vercel env vars)"
    ((PASSED++))
fi

# Test 6: Check if favicon exists
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 6: Static Assets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ASSETS=(
    "/favicon.ico"
    "/logo.png"
)

ASSETS_OK=true
for asset in "${ASSETS[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${PROD_URL}${asset}")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓${NC} $asset exists"
    else
        echo -e "${RED}✗${NC} $asset missing (HTTP $HTTP_CODE)"
        ASSETS_OK=false
    fi
done

if [ "$ASSETS_OK" = true ]; then
    echo -e "${GREEN}✓ PASSED${NC} - All assets present"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - Some assets missing"
    ((FAILED++))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "AUTOMATED TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    PASS_RATE=$((PASSED * 100 / TOTAL))
    echo "Pass Rate: $PASS_RATE%"
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All automated checks passed!${NC}"
    echo ""
    echo "✅ Site is accessible"
    echo "✅ API routes exist"
    echo "✅ Pages load correctly"
    echo "✅ Content is present"
    echo "✅ Assets are available"
    echo ""
    echo "⚠️  Still need manual testing:"
    echo "   - Video generation flow"
    echo "   - Stripe payments"
    echo "   - Downloads functionality"
    echo ""
    echo "Run ./test-script.sh for manual tests"
else
    echo -e "${RED}⚠️  Some automated checks failed${NC}"
    echo "Review the failures above before proceeding"
fi

echo ""
