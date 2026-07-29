import spock.lang.Specification

class ReeferMonitorGroovyImplSpec extends Specification {

    def monitor = new ReeferMonitorGroovyImpl()

    def "reports OK status when temperature is within the deviation threshold"() {
        when:
        def result = monitor.processReeferUpdate([
            containerId: 'OOLU8814423', actualTemp: -18.3,
            setPoint: -18.0, yardLocation: 'RF-A-04-02', timestamp: new Date()
        ])

        then:
        result.status == 'OK'
    }

    def "reports ALERT status when deviation exceeds the 2.0C threshold"() {
        when:
        def result = monitor.processReeferUpdate([
            containerId: 'MSCU4401872', actualTemp: -14.1,
            setPoint: -18.0, yardLocation: 'RF-B-07-01', timestamp: new Date()
        ])

        then:
        result.status == 'ALERT'
        result.deviation == 3.9d
    }

    def "does not alert at exactly the threshold boundary"() {
        when:
        def result = monitor.processReeferUpdate([
            containerId: 'MSCU4401872', actualTemp: -16.0,
            setPoint: -18.0, yardLocation: 'RF-B-07-01', timestamp: new Date()
        ])

        then:
        result.status == 'OK'
    }

    def "escalates when a deviation has persisted beyond the escalation window"() {
        given:
        Date thirtyFiveMinutesAgo = new Date(System.currentTimeMillis() - 35 * 60000)

        when:
        def result = monitor.processReeferUpdate([
            containerId: 'HLXU2290034', actualTemp: -12.0,
            setPoint: -18.0, yardLocation: 'RF-C-02-05',
            timestamp: new Date(), previousAlertTime: thirtyFiveMinutesAgo
        ])

        then:
        result.status == 'ALERT'
        noExceptionThrown()
    }

    def "does not escalate when the deviation has not yet persisted 30 minutes"() {
        given:
        Date fiveMinutesAgo = new Date(System.currentTimeMillis() - 5 * 60000)

        when:
        def result = monitor.processReeferUpdate([
            containerId: 'HLXU2290034', actualTemp: -12.0,
            setPoint: -18.0, yardLocation: 'RF-C-02-05',
            timestamp: new Date(), previousAlertTime: fiveMinutesAgo
        ])

        then:
        result.status == 'ALERT'
        noExceptionThrown()
    }

    def "defaults yard location to UNKNOWN when not provided"() {
        when:
        def result = monitor.processReeferUpdate([
            containerId: 'OOLU8814423', actualTemp: -18.0, setPoint: -18.0
        ])

        then:
        result.location == 'UNKNOWN'
    }
}
