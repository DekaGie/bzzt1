interface Config {
  port: number;

  verifyToken: string;

  accessToken: string;

  ocrSpaceApiKey: string;

  postgresUrl: string;

  esUrl: string;
}

export default Config
