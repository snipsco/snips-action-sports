import { i18n } from 'snips-toolkit'
import { beautify } from '../../beautify'
import { RankingsPayload, Team, SchedulePayload, Game } from '../../../api/nba'
import { time } from '../../time'

export const nbaTranslation = {
    tournamentRankingsToSpeech(rankings: RankingsPayload): string {
        let tts: string = ''

        for (let conference of rankings.conferences) {
            let teams: Team[] = []

            for (let division of conference.divisions) {
                teams = teams.concat(division.teams)
            }

            teams.sort((t1, t2) => t1.rank.conference - t2.rank.conference)

            tts += i18n.translate('sports.nba.tournamentStandings.standingsInConference', {
                conference: conference.name,
                team_1: teams[0].name,
                team_2: teams[1].name,
                team_3: teams[2].name
            })
            tts += ' '

            for (let division of conference.divisions) {
                tts += i18n.translate('sports.nba.tournamentStandings.firstInDivision', {
                    team: division.teams[0].name,
                    division: division.name
                })
                tts += ' '
            }
            tts += ' '
        }

        return tts
    },

    teamRankingToSpeech(rankings: RankingsPayload, teamId: string): string {
        let tts: string = ''

        for (let conference of rankings.conferences) {
            for (let division of conference.divisions) {
                let team = division.teams.find(t => t.sr_id === teamId)

                if (team) {
                    tts += i18n.translate('sports.nba.tournamentStandings.standingInConference', {
                        team: team.name,
                        rank: team.rank.conference,
                        conference: conference.name
                    })
                    tts += ' '

                    tts += i18n.translate('sports.nba.tournamentStandings.standingInDivision', {
                        team: team.name,
                        rank: team.rank.division,
                        division: division.name
                    })
                }
            }
        } 

        return tts
    },

    tournamentScheduleToSpeech(schedule: SchedulePayload): string {
        let tts: string = ''

        const nextDate = new Date(schedule.games[0].scheduled)
        const games = schedule.games.filter(
            g => time.areSameDays(new Date(g.scheduled), nextDate)
        )

        tts += i18n.translate('sports.nba.tournamentSchedule.introduction', {
            date: beautify.date(new Date(games[0].scheduled))
        })
        tts += ' '

        for (let game of games) {
            tts += i18n.randomTranslation('sports.nba.tournamentSchedule.game', {
                team_1: game.home.name,
                team_2: game.away.name,
                time: beautify.time(new Date(game.scheduled))
            })
            tts += ' '
        }

        return tts
    },

    teamScheduleToSpeech(schedule: SchedulePayload, firstTeamId: string): string {
        let tts: string = ''
            
        const scheduledGame = schedule.games[0]
        const scheduled = new Date(scheduledGame.scheduled)

        tts += i18n.translate('sports.nba.teamSchedule.nextMatch', {
            team_1: (scheduledGame.home.sr_id === firstTeamId) ? scheduledGame.home.name : scheduledGame.away.name,
            team_2: (scheduledGame.home.sr_id === firstTeamId) ? scheduledGame.away.name : scheduledGame.home.name,
            date: beautify.date(scheduled),
            time: beautify.time(scheduled)
        })

        return tts
    },

    teamResultToSpeech(game: Game, firstTeamId: string, longTts = true): string {
        let tts: string = ''

        const team1 = (game.home.sr_id === firstTeamId) ? game.home : game.away
        const team2 = (game.home.sr_id === firstTeamId) ? game.away : game.home

        const team1Score = (team1.sr_id === game.home.sr_id) ? game.home_points : game.away_points
        const team2Score = (team2.sr_id === game.home.sr_id) ? game.home_points : game.away_points

        const key = (team1Score === team2Score)
            ? 'teamTied'
            : ((team1Score < team2Score) ? 'teamLost' : 'teamWon')

        tts += i18n.translate((longTts ? 'sports.nba.matchResults.' : 'sports.nba.tournamentResults.') + key, {
            team_1: team1.name,
            team_2: team2.name,
            date: beautify.date(new Date(game.scheduled)),
            team_1_score: team1Score,
            team_2_score: team2Score
        })

        return tts
    },

    tournamentResultsToSpeech(schedule: SchedulePayload): string {
        let tts: string = ''

        const day = new Date(schedule.games[schedule.games.length - 1].scheduled)

        tts += i18n.translate('sports.nba.tournamentResults.introduction', {
            date: beautify.date(day)
        })
        tts += ' '

        // printing games played the same day
        schedule.games = schedule.games.filter(
            g => time.areSameDays(day, new Date(g.scheduled))
        )

        for (let game of schedule.games) {
            tts += nbaTranslation.teamResultToSpeech(game, game.home.sr_id, false)
            tts += ' '
        }

        return tts
    }
}
