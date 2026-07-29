/**
 * GateTransactionInterceptor.groovy
 * ===================================
 * Navis N4 Code Extension — Gate Workflow Interceptor
 *
 * Hook type: Groovy code injection via Gate SDK
 * Injection point: Gate transaction processing — fires when a truck
 *   completes gate entry and N4 processes the transaction.
 *
 * At CSP Zeebrugge, the gate is managed by Camco GOS (Gate Operating
 * System), which sends the transaction to N4 via API. This hook intercepts
 * that flow to add terminal-specific validations.
 *
 * Validations performed:
 *   1. Truck licence plate matches the VBS pre-announcement
 *   2. Container has no active customs hold (EDO/release check)
 *   3. Transaction is logged for audit trail
 */
class GateTransactionInterceptor {

    // In real N4 these are injected by the framework
    def truckVisit     // TruckVisitDetails from Gate SDK
    def unit           // ArgoUnit being collected/delivered
    def operator       // N4 operator performing the transaction
    def log            // N4 logger (writes to N4 event log)

    /**
     * Main gate validation method.
     * Called by N4 Gate SDK at transaction time.
     */
    def validateGateTransaction(Map transactionData) {
        String containerId  = transactionData.containerId?.toUpperCase()?.trim()
        String truckPlate   = transactionData.truckPlate?.toUpperCase()?.replaceAll(/\s/, '')
        String direction    = transactionData.direction   // 'IN' or 'OUT'
        String vbsBookingId = transactionData.vbsBookingId

        logAudit("Gate transaction started: ${containerId} | ${truckPlate} | ${direction}")

        checkVbsMatch(containerId, truckPlate, vbsBookingId)
        checkCustomsHold(containerId)
        checkPinNumber(containerId, transactionData.pinNumber, direction)

        logAudit("Gate transaction APPROVED: ${containerId} | ${truckPlate}")
        return [status: 'APPROVED', containerId: containerId, truckPlate: truckPlate]
    }

    /**
     * Verify the truck plate matches the VBS booking.
     * Camco VBS pre-registers truck + driver + container.
     * If they don't match, gate must not open.
     */
    private void checkVbsMatch(String containerId, String truckPlate, String vbsBookingId) {
        if (!vbsBookingId) {
            throw new Exception(
                "No VBS booking found for container ${containerId}. " +
                "Truck must pre-register via the VBS portal before gate entry."
            )
        }

        // In production: query VBS API or N4 custom field for registered plate
        String registeredPlate = lookupVbsPlate(vbsBookingId)

        if (registeredPlate && registeredPlate != truckPlate) {
            throw new Exception(
                "Licence plate mismatch for VBS booking ${vbsBookingId}. " +
                "Expected: ${registeredPlate}, Got: ${truckPlate}. " +
                "Contact gate control."
            )
        }
    }

    /**
     * Check N4 holds on the container.
     * A customs hold (EDO not yet received) must block gate-out.
     */
    private void checkCustomsHold(String containerId) {
        // In production: query N4 HoldApplicability API
        // Pattern: check for holds with category 'CUSTOMS' or 'EDO'
        List activeHolds = lookupActiveHolds(containerId)

        List customsHolds = activeHolds.findAll { it.holdCategory in ['CUSTOMS', 'EDO', 'RELEASE'] }

        if (customsHolds) {
            String holdList = customsHolds.collect { it.holdId }.join(', ')
            throw new Exception(
                "Container ${containerId} has active holds: ${holdList}. " +
                "Gate release blocked until holds are resolved."
            )
        }
    }

    /**
     * PIN number check for collect transactions.
     * Shipping lines issue a PIN that truckers must provide at gate.
     */
    private void checkPinNumber(String containerId, String pinNumber, String direction) {
        if (direction != 'OUT') return // only needed for collection

        if (!pinNumber) {
            throw new Exception(
                "PIN number required to collect container ${containerId}. " +
                "Obtain PIN from the shipping line or via the VBS portal."
            )
        }

        String expectedPin = lookupContainerPin(containerId)
        if (expectedPin && expectedPin != pinNumber) {
            throw new Exception(
                "Invalid PIN for container ${containerId}. " +
                "Please verify with the shipping line."
            )
        }
    }

    private void logAudit(String message) {
        String timestamp = new Date().format('yyyy-MM-dd HH:mm:ss')
        println "[GATE AUDIT ${timestamp}] ${message}"
        // In production: log?.info(message) writes to N4 event log
    }

    // Stubs — in production these call N4 APIs or the VBS integration layer.
    // Kept `protected` (not `private`) so tests can stub them as a seam,
    // instead of hitting real N4/VBS APIs from a unit test.
    protected String lookupVbsPlate(String bookingId) { return '1-ABC-234' }
    protected List lookupActiveHolds(String containerId) { return [] }
    protected String lookupContainerPin(String containerId) { return '4821' }

    // Simulator
    static void main(String[] args) {
        def interceptor = new GateTransactionInterceptor()

        println "=== GateTransactionInterceptor — Simulator ===\n"

        // Test 1: Clean transaction
        println "Test 1: Valid gate-out transaction"
        def result = interceptor.validateGateTransaction([
            containerId : 'CSNU7402841',
            truckPlate  : '1-ABC-234',
            direction   : 'OUT',
            vbsBookingId: 'VBS-2026-08821',
            pinNumber   : '4821'
        ])
        println "  ✓ Result: ${result.status}\n"

        // Test 2: Missing VBS booking
        println "Test 2: No VBS booking"
        try {
            interceptor.validateGateTransaction([
                containerId: 'TCKU3291055', truckPlate: '1-XYZ-999',
                direction: 'OUT', vbsBookingId: null, pinNumber: '1234'
            ])
        } catch (Exception e) {
            println "  ✓ Blocked: ${e.message}\n"
        }

        // Test 3: Wrong PIN
        println "Test 3: Wrong PIN number"
        try {
            interceptor.validateGateTransaction([
                containerId: 'CSNU7402841', truckPlate: '1-ABC-234',
                direction: 'OUT', vbsBookingId: 'VBS-2026-08821', pinNumber: '9999'
            ])
        } catch (Exception e) {
            println "  ✓ Blocked: ${e.message}"
        }

        println "\n=== Simulation complete ==="
    }
}
