import spock.lang.Specification
import spock.lang.Unroll

class TbdUnitValidationGroovyImplSpec extends Specification {

    def hook = new TbdUnitValidationGroovyImpl()

    def "accepts a container ID with a correct ISO 6346 check digit"() {
        expect:
        hook.validateContainerId('CSNU7402845') == null
    }

    @Unroll
    def "rejects malformed container ID '#unitId'"() {
        when:
        hook.validateContainerId(unitId)

        then:
        Exception e = thrown(Exception)
        e.message.contains('Invalid container ID format')

        where:
        unitId << ['INVALID123', 'CS1U7402845', 'CSNU74028', 'CSNU74028455']
    }

    def "rejects a container ID with an incorrect check digit"() {
        when:
        hook.validateContainerId('CSNU7402849')

        then:
        Exception e = thrown(Exception)
        e.message.contains('invalid check digit')
    }

    def "rejects a missing container ID"() {
        when:
        hook.validateContainerId(null)

        then:
        Exception e = thrown(Exception)
        e.message.contains('Unit ID is missing')
    }

    def "blocks dangerous goods containers without a hazmat inspection record"() {
        given:
        def unit = [unitId: 'CSNU7402845', unitDgClass: '3', getCustomField: { String f -> null }]

        when:
        hook.validateDangerousGoods(unit)

        then:
        Exception e = thrown(Exception)
        e.message.contains('no hazmat inspection record')
    }

    def "allows dangerous goods containers with a hazmat inspection record"() {
        given:
        def unit = [unitId: 'CSNU7402845', unitDgClass: '3', getCustomField: { String f -> f == 'HAZMAT_INSPECTED' ? 'Y' : null }]

        expect:
        hook.validateDangerousGoods(unit) == null
    }

    def "blocks reefer containers without a temperature set-point"() {
        given:
        def unit = [unitId: 'MSCU4401872', unitEquipment: [eqEquipType: 'RF']]
        def ufv = [getCustomField: { String f -> null }]

        when:
        hook.validateReeferSetPoint(unit, ufv)

        then:
        Exception e = thrown(Exception)
        e.message.contains('no temperature set-point')
    }

    def "blocks reefer containers with a set-point outside the valid range"() {
        given:
        def unit = [unitId: 'MSCU4401872', unitEquipment: [eqEquipType: 'RF']]
        def ufv = [getCustomField: { String f -> f == 'REEFER_SET_POINT' ? '45' : null }]

        when:
        hook.validateReeferSetPoint(unit, ufv)

        then:
        Exception e = thrown(Exception)
        e.message.contains('outside the valid range')
    }

    def "allows reefer containers with a valid set-point"() {
        given:
        def unit = [unitId: 'MSCU4401872', unitEquipment: [eqEquipType: 'RF']]
        def ufv = [getCustomField: { String f -> f == 'REEFER_SET_POINT' ? '-18.0' : null }]

        expect:
        hook.validateReeferSetPoint(unit, ufv) == null
    }

    def "skips reefer validation for non-reefer equipment"() {
        given:
        def unit = [unitId: 'CSNU7402845', unitEquipment: [eqEquipType: 'GP']]
        def ufv = [getCustomField: { String f -> null }]

        expect:
        hook.validateReeferSetPoint(unit, ufv) == null
    }

    def "full validation pipeline passes for a clean, non-DG, non-reefer unit"() {
        given:
        hook.unit = [unitId: 'CSNU7402845', unitDgClass: null, unitEquipment: [eqEquipType: 'GP']]
        hook.ufv = [getCustomField: { String f -> null }]

        expect:
        hook.performVesselLoadValidations() == null
    }
}
