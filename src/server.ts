import type * as Party from "partykit/server";

// Representing a person's position
type Position = {
  lat: number;
  lng: number;
  id: string;
};

// Messages that we'll send to the client
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
  // Let's use hibernation mode so we can scale to thousands of connections
  static options = {
    hibernate: true,
  };

  constructor(readonly room: Party.Room) {
    // A no-op, but this assigns room to this.room (thanks typescript!)
  }

  onConnect(
    conn: Party.Connection<ConnectionState>,
    ctx: Party.ConnectionContext
  ) {
    // Whenever a fresh connection is made, we'll send the entire state to the new connection
    // send the entire state to the new connection

    // First, let's extract the position from the Cloudflare headers
    const { request } = ctx;
    const lat = parseFloat(request.cf!.latitude as string);
    const lng = parseFloat(request.cf!.longitude as string);
    const id = conn.id;
    // And save this on the connection's state
    conn.setState({
      position: {
        lat,
        lng,
        id,
      },
    });

    // Now, let's send the entire state to the new connection
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

  // Whenever a connection closes (or errors),
  // we'll broadcast a message to all other connections
  // to remove the marker
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

// That's it! Easy.

Server satisfies Party.Worker;
