import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';

interface ConnectClients {
  [id: string]: {socket: Socket, user: User};
}

@Injectable()
export class MessagesWsService {
  private connectedClients: ConnectClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRespository: Repository<User>) { }

  async registerClient(client: Socket, id:string) {
   
    const user = await this.userRespository.findOneBy({ uuid: id })
    if(!user ) throw new Error("User not exist");
    if (!user.isActive) throw new Error("User not that active");
    
    this.getCheckSocketInstance(user)
    
    this.connectedClients[client.id] = {socket: client, user};
  }

  removeClient(client: Socket) {
    delete this.connectedClients[client.id];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }

  getUserFullName(socketId:string):string{
    return this.connectedClients[socketId].user.fullName
  }

  getCheckSocketInstance(user:User) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClient = this.connectedClients[clientId]
      if (connectedClient.user.uuid === user.uuid) {
        connectedClient.socket.disconnect()
        this.removeClient(connectedClient.socket)
        break;
      }
    }
  }
}
