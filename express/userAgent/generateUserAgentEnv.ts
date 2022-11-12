export const generateUserAgentEnv = (
  port: number,
  userName: string,
  userPassword: string,
) => {
  return {
    USER_AGENT_PORT: String(port),
    USER_AGENT_NAME: userName,
    USER_AGENT_PASSWORD: userPassword,
  }
}
