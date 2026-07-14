import ChallengeProgress from "../../models/challengeProgress.model.js";

export const getChallengeProgress =
async (challengeId,userId)=>{

    return await ChallengeProgress.findOne({

        challengeId,

        userId

    });

}