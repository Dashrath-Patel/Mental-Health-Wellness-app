import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JournalModule } from './journal/journal.module';
import { ChatModule } from './chat/chat.module';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-wellness'
    ),
    AuthModule, 
    UsersModule, 
    JournalModule, 
    ChatModule, 
    AiAssistantModule, 
    AppointmentsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
