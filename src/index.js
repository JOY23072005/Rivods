import express from "express";
import cors from "cors";

import AuthRoutes from "./routes/auth.route.js";
import UserRoutes from "./routes/user.route.js";
import OrgRoutes from "./routes/org.route.js";
import redeemRoutes from "./routes/redemption.route.js"
import rewardRoutes from "./routes/reward.route.js"
import stepRoutes from "./routes/step.route.js"
import UserManageRoutes from "./routes/userManagement.route.js"
import ChallengeRoutes from "./routes/challenge.route.js"

import dns from "dns"
// Setting Google or Cloudflare DNS before connecting
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Rivod's Server is running" });
});

app.use("/auth", AuthRoutes);
app.use("/user", UserRoutes);
app.use("/org", OrgRoutes);
app.use("/step", stepRoutes);
app.use("/reward", rewardRoutes);
app.use("/redeem", redeemRoutes);
app.use("/manage-users",UserManageRoutes);
app.use("/challenges",ChallengeRoutes);

app.listen('5001',()=>{
    console.log("server running");
})

export default app; // ✅ IMPORTANT
