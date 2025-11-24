
class FirestoreManager {

    constructor(db, leagueId) {
        this.db = db
        this.leagueDoc = db.collection("leagues").doc(leagueId)
        this.autoDraftTimer = null
        this.initSnapshot()
    }

    async getLeagueInfo(league) {
        const playerQueried = await this.leagueDoc.collection('players').where('teamId', '==', '').orderBy('avgFantasyPoints', 'desc').limit(1).get()
        let defaultPlayerToDraft = null;
        await playerQueried.forEach(player => {
            console.log(player.id)
            defaultPlayerToDraft = player.id
        })
        return {
            curTeamToDraft: league.draftOrder[league.draftPlace].team,
            defaultPlayerToDraft: defaultPlayerToDraft
        };
    }

    async getTeamIds() {
        const teams = await this.leagueDoc.collection('teams').get()
        const teamIds = []
        await teams.forEach(team => {
            teamIds.push(team.id)
        });
        return teamIds
    }

    shouldStartDraftTimer(league) {
        return false && league.startDraft && league.draftPlace < league.draftOrder.length
    }

    draft(teamId, playerId) {
        if (this.autoDraftTimer !== null) {
            clearTimeout(this.autoDraftTimer)
        }
        // TODO: draft
    }

    async initSnapshot() {
        this.leagueDoc.onSnapshot(async docSnapshot => {
            // should be getting called every time we draft
            try {
                const leagueData = docSnapshot.data()
                console.log(`Received doc snapshot: ${JSON.stringify(leagueData)}`);
                const leagueInfo = await this.getLeagueInfo(leagueData)
                console.log('League info: ' + JSON.stringify(leagueInfo))
                if (this.shouldStartDraftTimer(leagueData)) {
                    this.autoDraftTimer = setTimeout(this.draft, 60000, leagueInfo.curTeamToDraft, leagueInfo.defaultPlayerToDraft)
                }
            } catch (error) {
                console.log("test1234455: " + error.message)
            }
        }, err => {
            console.log(`Encountered error: ${err}`);
        });
    }
}

module.exports = {
    FirestoreManager
}