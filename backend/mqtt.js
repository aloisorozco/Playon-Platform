const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const mqtt = require('mqtt')

const { FirestoreManager } = require('./firestore')
const serviceAccount = require('./credentials.json');

const main = async () => {
    initializeApp({
        credential: cert(serviceAccount)
    });
    const db = getFirestore();

    const url = 'mqtt://broker.hivemq.com:1883'
    const options = {
        clean: true,
        connectTimeout: 4000,
    }

    let args = process.argv.slice(2);
    const leagueId = args[0]
    console.log(`Starting server for league id: ${leagueId}`)
    const firestoreManager = new FirestoreManager(db, leagueId)

    const draftLeagueTopic = `draft/${leagueId}`
    const teamIds = await firestoreManager.getTeamIds()
    const draftTeamTopics = teamIds.map((teamId) => {
        return `${draftLeagueTopic}/${teamId}/draft`
    })

    // MQTT HANDLERS
    const mqttClient = mqtt.connect(url, options)
    mqttClient.on('connect', function () {
        mqttClient.subscribe(draftLeagueTopic, function (err) {
            if (!err) {
                mqttClient.publish(draftLeagueTopic, `Started topic for league ${leagueId}`)
                const draftLeagueTopicMessage = {
                    lastDrafted: {
                        team: "teamId",
                        player: "playerId"
                    },
                    curTeamToDraft: "teamId"
                }

            }
        })
        teamIds.forEach((teamId) => {
            mqttClient.subscribe(`${draftLeagueTopic}/${teamId}/draft`, function (err) {
                if (!err) {
                    mqttClient.publish(`${draftLeagueTopic}/${teamId}/draft`, `Started topic for league ${leagueId} team ${teamId}`)
                    const draftTeamTopicMessage = {
                        player: "playerId"
                    }
                }
            })
        })

        // This is what the client (frontend) will be listening to
        teamIds.forEach((teamId) => {
            mqttClient.subscribe(`${draftLeagueTopic}/${teamId}`, function (err) {
                if (!err) {
                    mqttClient.publish(`${draftLeagueTopic}/${teamId}`, `Started topic for league ${leagueId} team ${teamId}`)
                    const draftTeamTopicMessage = {
                        remainingTime: 60
                    }
                }
            })
        })

    })

    mqttClient.on('message', function (topic, message) {
        try {
            if (draftTeamTopics.includes(topic)) {
                if (topic.includes(firestoreManager.leagueInfo.curTeamToDraft) && firestoreManager.autoDraftTimer !== null) {
                    // TODO: get message data
                    const messageInfo = {}
                    firestoreManager.draft(messageInfo.teamId, messageInfo.playerId)
                }
            }
        } catch (err) {
            console.log("test: " + err.message)
        }
        console.log("test123: " + message.toString())
        //mqttClient.end()
    })
}
main()