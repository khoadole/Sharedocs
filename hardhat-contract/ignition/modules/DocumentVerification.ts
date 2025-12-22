import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DocumentVerificationModule", (m) => {
  const documentVerification = m.contract("DocumentVerification");
  return { documentVerification };
});