## 🎈 globe-party

[Cobe](https://cobe.vercel.app/) ⤫ [Phenomenon](https://www.npmjs.com/package/phenomenon) ⤫ [PartyKit](https://partykit.io/)

![image](https://github.com/partykit/sketch-globe/assets/18808/bc199d85-4f8f-4a71-b833-7af48ddebc65)

You've always wanted to show a spinning globe on your website that shows the location of every person on that page, right? Well, now you can!

This project has been made possible by the amazing [Cobe](https://cobe.vercel.app/) and [Phenomenon](https://www.npmjs.com/package/phenomenon) libraries. It's a fun little experiment that I hope you'll enjoy.

The ["server"](https://github.com/partykit/sketch-globe/blob/main/src/server.ts) is a PartyKit module that listens for incoming connections, reads location information from Cloudflare headers, and broadcasts that information to all connected clients. The ["client"](https://github.com/partykit/sketch-globe/blob/main/src/client.tsx) is a React app that connects to the server and displays the location of all connected clients on a spinning globe. Each of these is a 100 loc file, comments and all, that you can read in a few minutes.

Feel free to fork and remix!
