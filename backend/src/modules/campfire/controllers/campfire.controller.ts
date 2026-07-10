import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CampfireService } from '../services/campfire.service';
import { CreateCampfireDto } from '../dto/create-campfire.dto';
import { UpdateCampfireDto } from '../dto/update-campfire.dto';
import { CampfireQueryDto } from '../dto/campfire-query.dto';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  accountStatus: string;
}

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

@UseGuards(JwtAuthGuard)
@Controller('campfires')
export class CampfireController {
  constructor(private readonly campfireService: CampfireService) {}

  @Post()
  async createCampfire(@GetUser() user: AuthUser, @Body() dto: CreateCampfireDto) {
    return this.campfireService.create(user.userId, dto);
  }

  @Get()
  async getCampfires(@Query() query: CampfireQueryDto) {
    return this.campfireService.findAndCount(query);
  }

  @Get('workspace/:tab')
  async getWorkspace(@GetUser() user: AuthUser, @Param('tab') tab: string) {
    return this.campfireService.findWorkspace(user.userId, tab);
  }

  @Get(':id')
  async getCampfireById(@Param('id') id: string) {
    return this.campfireService.findById(id);
  }

  @Post(':id/remind')
  async toggleReminder(@GetUser() user: AuthUser, @Param('id') id: string) {
    return this.campfireService.toggleReminder(id, user.userId);
  }

  @Post(':id/join')
  async recordJoin(@GetUser() user: AuthUser, @Param('id') id: string) {
    await this.campfireService.recordJoin(id, user.userId);
    return { success: true };
  }


  @Patch(':id')
  async updateCampfire(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCampfireDto,
  ) {
    return this.campfireService.update(id, user.userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCampfire(@GetUser() user: AuthUser, @Param('id') id: string) {
    return this.campfireService.softDelete(id, user.userId);
  }

  @Post(':id/start')
  async startCampfire(@GetUser() user: AuthUser, @Param('id') id: string) {
    return this.campfireService.start(id, user.userId);
  }

  @Post(':id/end')
  async endCampfire(@GetUser() user: AuthUser, @Param('id') id: string) {
    return this.campfireService.end(id, user.userId);
  }
}
