import type * as Party from "partykit/server";

type Position = {
  lat: number;
  lng: number;
  id: string;
};

export type OutgoingMessage =
  | {
      type: "add-marker";
      position: Position;
    }
  | {
      type: "remove-marker";
      id: string;
    };

type ConnectionState = {
  position: Position;
};

export default class Server implements Party.Server {
  static options = {
    hibernate: true,
  };
  constructor(readonly room: Party.Room) {}
  onConnect(
    conn: Party.Connection<ConnectionState>,
    ctx: Party.ConnectionContext
  ) {
    // send the entire state to the new connection
    const { request } = ctx;
    const lat = parseFloat(request.cf!.latitude as string);
    const lng = parseFloat(request.cf!.longitude as string);
    const id = conn.id;
    conn.setState({
      position: {
        lat,
        lng,
        id,
      },
    });

    for (const connection of this.room.getConnections<ConnectionState>()) {
      try {
        conn.send(
          JSON.stringify({
            type: "add-marker",
            position: connection.state!.position,
          } satisfies OutgoingMessage)
        );
      } catch (err) {
        this.onCloseOrError(conn);
      }
    }
  }

  onCloseOrError(connection: Party.Connection<unknown>) {
    this.room.broadcast(
      JSON.stringify({
        type: "remove-marker",
        id: connection.id,
      } satisfies OutgoingMessage)
    );
  }

  onClose(connection: Party.Connection<unknown>): void | Promise<void> {
    this.onCloseOrError(connection);
  }
  onError(
    connection: Party.Connection<unknown>,
    error: Error
  ): void | Promise<void> {
    this.onCloseOrError(connection);
  }
}

Server satisfies Party.Worker;
