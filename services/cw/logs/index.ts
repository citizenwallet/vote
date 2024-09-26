import { Config } from "../config";

export class LogService {
  private url: string;
  private wsUrl: string;

  constructor(private config: Config) {
    this.url = config.indexer.url;
    this.wsUrl = config.indexer.ws_url;
  }
}
