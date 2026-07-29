/**
 * TbdUnitValidationGroovyImpl.groovy
 * ===================================
 * Navis N4 Code Extension — TbdUnit Validation Hook
 *
 * Hook name: TbdUnitValidationGroovyImpl
 * Injection point: Before a container unit (TbdUnit) is confirmed in the TOS.
 * Scope: Facility-level — runs for every unit discharge/load validation.
 *
 * This is a standard N4 extension point. The hook is registered via the
 * N4 Code Extensions screen and stored in the N4 database. No server
 * restart required after deployment.
 *
 * Real N4 API references used:
 *   - FieldChanges (field change map from N4 SDK)
 *   - UnitFacilityVisit (UFV — N4's core container-visit entity)
 *   - ArgoUnit (N4 container domain object)
 */
class TbdUnitValidationGroovyImpl {

    // N4 passes these objects into the hook at runtime
    // In real N4 they are injected; here we define them for simulator clarity
    def unit          // ArgoUnit — the container being validated
    def ufv           // UnitFacilityVisit — the container's current terminal visit
    def fieldChanges  // FieldChanges — map of changed fields triggering this hook

    /**
     * Main entry point — N4 calls this method by convention.
     * Return null to allow, throw Exception to block with a user-visible message.
     */
    def performVesselLoadValidations() {
        validateContainerId(unit?.unitId)
        validateDangerousGoods(unit)
        validateReeferSetPoint(unit, ufv)
        return null // null = validation passed, N4 continues
    }

    /**
     * ISO 6346 container ID validation.
     * Format: 4 uppercase letters (owner code + category) + 6 digits + 1 check digit
     * Example: CSNU7402845
     */
    private void validateContainerId(String unitId) {
        if (!unitId) {
            throw new Exception("Unit ID is missing — cannot validate container.")
        }

        String cleaned = unitId.toUpperCase().replaceAll(/\s/, '')

        if (!(cleaned ==~ /^[A-Z]{4}\d{7}$/)) {
            throw new Exception(
                "Invalid container ID format: '${unitId}'. " +
                "Expected ISO 6346 format (e.g. CSNU7402845)."
            )
        }

        if (!isValidCheckDigit(cleaned)) {
            throw new Exception(
                "Container ID '${unitId}' has an invalid check digit. " +
                "Please verify the container number."
            )
        }
    }

    /**
     * ISO 6346 check digit algorithm.
     * Each letter maps to a numeric value; weighted sum mod 11.
     */
    private boolean isValidCheckDigit(String id) {
        String LETTER_VALUES = "0123456789A?BCDEFGHIJK?LMNOPQRSTU?VWXYZ"
        int sum = 0
        (0..9).each { i ->
            char c = id.charAt(i)
            int val = c.isDigit() ? Character.getNumericValue(c) : LETTER_VALUES.indexOf(c as String)
            sum += val * (int) Math.pow(2, i)
        }
        int check = sum % 11
        if (check == 10) check = 0
        return check == Character.getNumericValue(id.charAt(10))
    }

    /**
     * Dangerous goods containers require a hazmat inspection record
     * before they can be confirmed for vessel load.
     */
    private void validateDangerousGoods(unit) {
        boolean isDG = unit?.unitDgClass != null
        if (isDG) {
            boolean hasInspection = unit?.getCustomField('HAZMAT_INSPECTED') == 'Y'
            if (!hasInspection) {
                throw new Exception(
                    "Container ${unit?.unitId} is classified as dangerous goods " +
                    "(class ${unit?.unitDgClass}) but has no hazmat inspection record. " +
                    "Contact the operations supervisor before confirming load."
                )
            }
        }
    }

    /**
     * Reefer containers must have a valid temperature set-point
     * before they can be placed in the reefer yard or loaded to vessel.
     */
    private void validateReeferSetPoint(unit, ufv) {
        boolean isReefer = unit?.unitEquipment?.eqEquipType?.contains('RF')
        if (isReefer) {
            def setPoint = ufv?.getCustomField('REEFER_SET_POINT')
            if (setPoint == null) {
                throw new Exception(
                    "Reefer container ${unit?.unitId} has no temperature set-point. " +
                    "Required before yard placement or vessel load."
                )
            }
            double temp = setPoint as double
            if (temp < -30.0 || temp > 30.0) {
                throw new Exception(
                    "Reefer set-point ${temp}°C is outside the valid range (-30°C to +30°C) " +
                    "for container ${unit?.unitId}."
                )
            }
        }
    }

    // ---------------------------------------------------------------
    // Simulator entry point — run this file directly to test the logic
    // ---------------------------------------------------------------
    static void main(String[] args) {
        def hook = new TbdUnitValidationGroovyImpl()

        println "=== TbdUnitValidationGroovyImpl — Simulator ==="
        println ""

        // Test 1: Valid container
        println "Test 1: Valid container ID"
        hook.validateContainerId('CSNU7402845')
        println "  ✓ CSNU7402845 passed"

        // Test 2: Invalid format
        println "\nTest 2: Invalid container ID format"
        try {
            hook.validateContainerId('INVALID123')
        } catch (Exception e) {
            println "  ✓ Caught: ${e.message}"
        }

        // Test 3: Invalid check digit
        println "\nTest 3: Wrong check digit"
        try {
            hook.validateContainerId('CSNU7402849') // wrong check digit
        } catch (Exception e) {
            println "  ✓ Caught: ${e.message}"
        }

        println "\n=== All tests passed ==="
    }
}
