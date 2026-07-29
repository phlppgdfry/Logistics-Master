import spock.lang.Specification

/**
 * Maps directly to the acceptance criteria in
 * n4-groovy-extensions/FUNCTIONAL_ANALYSIS.md (R1–R4).
 */
class GateTransactionInterceptorSpec extends Specification {

    def "approves a clean gate-out transaction (R1, R3)"() {
        given:
        def interceptor = Spy(GateTransactionInterceptor) {
            lookupVbsPlate(_) >> '1-ABC-234'
            lookupActiveHolds(_) >> []
            lookupContainerPin(_) >> '4821'
        }

        when:
        def result = interceptor.validateGateTransaction([
            containerId : 'CSNU7402845', truckPlate: '1-ABC-234',
            direction   : 'OUT', vbsBookingId: 'VBS-2026-08821', pinNumber: '4821'
        ])

        then:
        result.status == 'APPROVED'
    }

    def "blocks a transaction with no VBS booking (R1)"() {
        given:
        def interceptor = new GateTransactionInterceptor()

        when:
        interceptor.validateGateTransaction([
            containerId: 'TCKU3291055', truckPlate: '1-XYZ-999',
            direction: 'OUT', vbsBookingId: null, pinNumber: '1234'
        ])

        then:
        Exception e = thrown(Exception)
        e.message.contains('No VBS booking found')
    }

    def "blocks a transaction when the plate does not match the VBS booking (R1)"() {
        given:
        def interceptor = Spy(GateTransactionInterceptor) {
            lookupVbsPlate(_) >> '1-ABC-234'
        }

        when:
        interceptor.validateGateTransaction([
            containerId : 'CSNU7402845', truckPlate: '1-ZZZ-999',
            direction   : 'OUT', vbsBookingId: 'VBS-2026-08821', pinNumber: '4821'
        ])

        then:
        Exception e = thrown(Exception)
        e.message.contains('Licence plate mismatch')
    }

    def "blocks a container under an active customs hold and names the hold (R2)"() {
        given:
        def interceptor = Spy(GateTransactionInterceptor) {
            lookupVbsPlate(_) >> '1-ABC-234'
            lookupActiveHolds(_) >> [[holdId: 'H-991', holdCategory: 'CUSTOMS']]
        }

        when:
        interceptor.validateGateTransaction([
            containerId : 'CSNU7402845', truckPlate: '1-ABC-234',
            direction   : 'OUT', vbsBookingId: 'VBS-2026-08821', pinNumber: '4821'
        ])

        then:
        Exception e = thrown(Exception)
        e.message.contains('H-991')
        e.message.contains('Gate release blocked')
    }

    def "does not block on a hold outside the customs/EDO/release categories"() {
        given:
        def interceptor = Spy(GateTransactionInterceptor) {
            lookupVbsPlate(_) >> '1-ABC-234'
            lookupActiveHolds(_) >> [[holdId: 'H-100', holdCategory: 'DAMAGE']]
            lookupContainerPin(_) >> '4821'
        }

        when:
        def result = interceptor.validateGateTransaction([
            containerId : 'CSNU7402845', truckPlate: '1-ABC-234',
            direction   : 'OUT', vbsBookingId: 'VBS-2026-08821', pinNumber: '4821'
        ])

        then:
        result.status == 'APPROVED'
    }

    def "blocks a collect transaction with a missing PIN (R3)"() {
        given:
        def interceptor = Spy(GateTransactionInterceptor) {
            lookupVbsPlate(_) >> '1-ABC-234'
            lookupActiveHolds(_) >> []
        }

        when:
        interceptor.validateGateTransaction([
            containerId : 'CSNU7402845', truckPlate: '1-ABC-234',
            direction   : 'OUT', vbsBookingId: 'VBS-2026-08821', pinNumber: null
        ])

        then:
        Exception e = thrown(Exception)
        e.message.contains('PIN number required')
    }

    def "blocks a collect transaction with the wrong PIN (R3)"() {
        given:
        def interceptor = Spy(GateTransactionInterceptor) {
            lookupVbsPlate(_) >> '1-ABC-234'
            lookupActiveHolds(_) >> []
            lookupContainerPin(_) >> '4821'
        }

        when:
        interceptor.validateGateTransaction([
            containerId : 'CSNU7402845', truckPlate: '1-ABC-234',
            direction   : 'OUT', vbsBookingId: 'VBS-2026-08821', pinNumber: '0000'
        ])

        then:
        Exception e = thrown(Exception)
        e.message.contains('Invalid PIN')
    }

    def "does not require a PIN for gate-in transactions"() {
        given:
        def interceptor = Spy(GateTransactionInterceptor) {
            lookupVbsPlate(_) >> '1-ABC-234'
            lookupActiveHolds(_) >> []
        }

        when:
        def result = interceptor.validateGateTransaction([
            containerId : 'CSNU7402845', truckPlate: '1-ABC-234',
            direction   : 'IN', vbsBookingId: 'VBS-2026-08821', pinNumber: null
        ])

        then:
        result.status == 'APPROVED'
    }
}
