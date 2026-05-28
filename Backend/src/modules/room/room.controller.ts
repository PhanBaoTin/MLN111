import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { QuickCreateRoomDto } from './dto/quick-create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  /**
   * One-shot: create a quiz (with image & questions) AND a room simultaneously.
   * Returns { quiz, room, hostToken } ready for admin page.
   */
  @Post('quick-create')
  quickCreate(@Body() dto: QuickCreateRoomDto) {
    return this.roomService.quickCreate(dto);
  }

  @Post('launch-existing')
  launchExisting(@Body() dto: import('./dto/launch-existing-room.dto').LaunchExistingRoomDto) {
    return this.roomService.launchExisting(dto);
  }

  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomService.create(dto);
  }

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.roomService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }
}
