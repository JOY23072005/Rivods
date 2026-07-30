import FraudEvent from "../../models/fraudEvent.model.js";
import User from "../../models/user.model.js";
import { FRAUD_SCORES } from "./fraudConst.js";

export const createFraudEvent = async ({
    userId,
    organizationId,
    deviceId = null,
    eventType,
    metadata = {},
}) => {

    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);

    const existing = await FraudEvent.findOne({
        userId,
        deviceId,
        eventType,
        createdAt:{
            $gte:startOfToday
        }
    });

    if(existing){
        return;
    }     

    const score = FRAUD_SCORES[eventType] ?? 0;

    //console.log("Creating new fraud");
    //console.log(eventType);
    //console.log(score);

    await FraudEvent.create({
        userId,
        organizationId,
        deviceId,
        eventType,
        score,
        metadata,
    });
    //console.log("Searching for user...");

    const user = await User.findById(userId);

    if (!user) return;
    //console.log("user found");

    user.fraudScore += score;

    if (user.fraudScore >= 100) {
        user.stepSyncBlocked = true;
    }

    if (user.fraudScore >= 200) {
        user.isSuspended = true;
    }
    //console.log("strict actions taken");

    await user.save();
};