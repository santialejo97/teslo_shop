import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { Payload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(private readonly messagesWsService: MessagesWsService,
              private readonly jwtServices: JwtService) { }

  handleDisconnect(client: Socket) {
    console.log('Cliente Desconectado: ', client.id);
    this.messagesWsService.removeClient(client);
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string
    let payload: Payload;
    try {
      payload = this.jwtServices.verify(token)
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect()
      // throw new WsException("Credencial invalid");
      return;
    }
    //  console.log({payload})
    
    
    // console.log({ connect: this.messagesWsService.getConnectedClients() });
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  @SubscribeMessage('message')
  onMessage(client: Socket, payload: NewMessageDto) {
    

    //! Esto emite solo al cliente que realiza el llamado del evento
    // client.emit('message-serve', {fullName: 'soy yo', message:payload.message || 'No hay un mensaje' })

    //! Emitir a todo los clientes Menos al cliente inicial
    // client.broadcast.emit('message-serve', {fullName: 'soy yo', message:payload.message || 'No hay un mensaje' })
    const userName: string = this.messagesWsService.getUserFullName(client.id)
    //! Emitir a todos junto al cliente 
    this.wss.emit('message-serve', {fullName: userName, message:payload.message || 'No hay un mensaje' })
  }


}
