import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dto/new-message.dto';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(private readonly messagesWsService: MessagesWsService) {}

  handleDisconnect(client: Socket) {
    // console.log('Cliente Desconectado: ', client.id);
    this.messagesWsService.removeClient(client);
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  handleConnection(client: Socket) {
    // console.log('Cliente conectado: ', client.id);
    this.messagesWsService.registerClient(client);
    // console.log({ connect: this.messagesWsService.getConnectedClients() });
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  @SubscribeMessage('message')
  onMessage(client: Socket, payload: NewMessageDto) {
    console.log(client.id, payload.message);
  }
}
