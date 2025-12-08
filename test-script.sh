#!/bin/bash

# BulkTok Manual Testing Script
# This script helps you test critical functionality before launch

echo "🧪 BulkTok Pre-Launch Testing Script"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0
SKIPPED=0

# Function to prompt for test result
test_result() {
    local test_name=$1
    echo ""
    echo -e "${YELLOW}Test: $test_name${NC}"
    read -p "Did this test PASS? (y/n/s to skip): " result
    
    case $result in
        y|Y)
            echo -e "${GREEN}✓ PASSED${NC}"
            ((PASSED++))
            ;;
        n|N)
            echo -e "${RED}✗ FAILED${NC}"
            read -p "Describe the issue: " issue
            echo "Issue: $issue" >> test_results.txt
            ((FAILED++))
            ;;
        s|S)
            echo -e "${YELLOW}⊘ SKIPPED${NC}"
            ((SKIPPED++))
            ;;
        *)
            echo "Invalid input. Marking as SKIPPED"
            ((SKIPPED++))
            ;;
    esac
}

# Clear previous results
> test_results.txt
echo "BulkTok Test Results - $(date)" > test_results.txt
echo "================================" >> test_results.txt
echo "" >> test_results.txt

echo "🌐 Opening BulkTok in browser..."
echo "URL: https://bulktok-aa7we6ab7-cesarbautista97xs-projects.vercel.app"
echo ""
read -p "Press Enter when ready to start testing..."

# Test 1: Video Generation
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Video Generation (End-to-End)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Steps:"
echo "1. Login to your account"
echo "2. Go to /generate page"
echo "3. Upload 2-3 images"
echo "4. Upload 1 audio file"
echo "5. Enter a prompt (e.g., 'Professional presentation')"
echo "6. Select aspect ratio (e.g., 16:9)"
echo "7. Select resolution (e.g., 720p)"
echo "8. Click 'Generate Videos'"
echo "9. Wait 2-5 minutes"
echo "10. Check /downloads page for completed videos"
echo ""
test_result "Video Generation Flow"

# Test 2: Tier Limits - Frontend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Tier Limits - Frontend Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Steps:"
echo "1. Check your current tier in /account"
echo "2. Note your videos_generated_this_month"
echo "3. Go to /generate"
echo "4. Try to upload more images than your remaining quota"
echo "5. Verify: Upload component prevents exceeding limit"
echo "6. Verify: Warning message shows remaining quota"
echo ""
test_result "Frontend Tier Limits"

# Test 3: Stripe Payment - Pro Plan
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Stripe Payment - Pro Plan Subscription"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Use TEST card only!"
echo "Test Card: 4242 4242 4242 4242"
echo "Expiry: Any future date (e.g., 12/25)"
echo "CVC: Any 3 digits (e.g., 123)"
echo ""
echo "Steps:"
echo "1. Login as a FREE tier user"
echo "2. Go to /account"
echo "3. Click 'Upgrade to Pro' button"
echo "4. Complete Stripe checkout with test card"
echo "5. Verify: Redirected back to /account"
echo "6. Verify: Tier shows 'Pro'"
echo "7. Verify: Monthly limit shows 300 videos"
echo "8. Check Stripe Dashboard for subscription"
echo ""
test_result "Pro Plan Subscription"

# Test 4: Stripe Payment - Declined Card
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Stripe Payment - Declined Card"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Declined Card: 4000 0000 0000 0002"
echo ""
echo "Steps:"
echo "1. Try to subscribe with declined card"
echo "2. Verify: Clear error message from Stripe"
echo "3. Verify: User remains on FREE tier"
echo "4. Verify: No subscription created in Stripe"
echo ""
test_result "Declined Payment Handling"

# Test 5: Downloads Functionality
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Video Downloads"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Steps:"
echo "1. Go to /downloads"
echo "2. Verify: Videos load from Hedra"
echo "3. Select 3-5 complete videos (click to select)"
echo "4. Click 'Download Selected' button"
echo "5. Verify: Progress bar shows"
echo "6. Verify: ZIP file downloads"
echo "7. Extract ZIP and verify all videos present"
echo "8. Verify: Videos play correctly"
echo ""
test_result "Bulk Video Download"

# Test 6: Subscription Cancellation
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 6: Subscription Cancellation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Steps:"
echo "1. As a subscribed user, go to /account"
echo "2. Click 'Cancel Subscription' button"
echo "3. Confirm cancellation"
echo "4. Verify: Success message appears"
echo "5. Check Stripe Dashboard: subscription cancelled"
echo "6. Verify: Access maintained until period end"
echo ""
test_result "Subscription Cancellation"

# Test 7: API Key Security
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 7: API Key Security Notification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Steps:"
echo "1. Go to /account"
echo "2. Change your Hedra API key to a different value"
echo "3. Click 'Save API Key'"
echo "4. Verify: Warning toast appears"
echo "5. Check Vercel logs for security event"
echo ""
test_result "API Key Change Detection"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Skipped: $SKIPPED${NC}"
echo ""

TOTAL=$((PASSED + FAILED + SKIPPED))
if [ $TOTAL -gt 0 ]; then
    PASS_RATE=$((PASSED * 100 / TOTAL))
    echo "Pass Rate: $PASS_RATE%"
fi

echo ""
echo "Results saved to: test_results.txt"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Ready for production!${NC}"
else
    echo -e "${RED}⚠️  Some tests failed. Review issues before launching.${NC}"
    echo ""
    echo "Failed tests:"
    grep "Issue:" test_results.txt
fi

echo ""
echo "Next steps:"
echo "1. Review test_results.txt"
echo "2. Fix any failed tests"
echo "3. Re-run this script"
echo "4. When all pass, proceed to production!"
