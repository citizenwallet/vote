import { Config } from "../config";

export interface VoteData {
  optionIndex: number;
  pollId: string;
  topic: string;
}

export interface EventData<T> {
  hash: string;
  tx_hash: string;
  created_at: string;
  updated_at: string;
  nonce: number;
  sender: string;
  to: string;
  value: number;
  data: T;
  extra_data: null | { [key: string]: unknown };
  status: string;
}

export interface Event<T> {
  pool_id: string;
  type: "update" | "new" | "remove";
  id: string;
  data_type: string;
  data: EventData<T>;
}

export class EventsService {
  private connectedUrl: string | null = null;

  private isBlurred = false;

  private url: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;

  private handler: ((event: Event<any>) => void) | null = null;

  constructor(config: Config) {
    console.log("constructing...");
    this.url = config.indexer.url;
    this.wsUrl = config.indexer.ws_url;
  }

  public connect(
    contract: string,
    topic: string,
    args?: { [key: string]: string }
  ): () => void {
    let url = `${this.wsUrl}/events/${contract}/${topic}`;
    if (args) {
      const queryString = Object.entries(args)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

      url += `?${queryString}`;
    }

    console.log("Connecting to", url);

    this.initWebSocket(url);

    window.addEventListener("focus", this.handleFocus);
    window.addEventListener("blur", this.handleBlur);

    return () => {
      this.disconnect();
      window.removeEventListener("focus", this.handleFocus);
      window.removeEventListener("blur", this.handleBlur);
    };
  }

  private initWebSocket(url: string): void {
    if (this.ws) {
      this.ws.close();
    }

    this.connectedUrl = url;

    this.ws = new WebSocket(url);
    this.ws.onopen = () => console.log("WebSocket connection established");
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onerror = (error) => console.error("WebSocket error:", error);
  }

  public setHandler(handler: (event: Event<any>) => void): void {
    this.handler = handler;
  }

  private handleMessage(event: MessageEvent): void {
    console.log("WebSocket message received:", event.data);
    if (this.handler) {
      this.handler(JSON.parse(event.data));
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log("WebSocket connection closed", event);
    if (this.isBlurred) {
      console.log("Not reconnecting because window is blurred");
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnect();
    } else {
      console.error("Max reconnect attempts reached");
    }
  }

  private reconnect(): void {
    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );
    setTimeout(() => {
      if (this.connectedUrl) {
        this.initWebSocket(this.connectedUrl);
      }
    }, this.reconnectInterval);
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }

  private handleFocus = (): void => {
    this.isBlurred = false;
    if (
      this.connectedUrl &&
      (!this.ws || this.ws.readyState === WebSocket.CLOSED)
    ) {
      console.log("Reconnecting on focus");
      this.initWebSocket(this.connectedUrl);
    }
  };

  private handleBlur = (): void => {
    this.isBlurred = true;
    console.log("Window blurred, closing WebSocket connection");
    this.disconnect();
  };
}
