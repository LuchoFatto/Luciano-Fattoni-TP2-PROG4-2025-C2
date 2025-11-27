import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentsService } from './comments.service';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // ============================
  //        GET COMMENTS
  // ============================
  @Get('post/:postId')
  async getComments(
    @Param('postId') postId: string,
    @Query('limit') limit = '10',
    @Query('offset') offset = '0',
  ) {
    return this.commentsService.getComments(
      postId,
      Number(limit),
      Number(offset),
    );
  }

  // ============================
  //        CREATE COMMENT
  // ============================
  @Post('post/:postId')
  async createComment(
    @Param('postId') postId: string,
    @Req() req: any,
    @Body() dto: CreateCommentDto,
  ) {
    const userId = req.user._id;
    return this.commentsService.createComment(postId, userId, dto);
  }

  // ============================
  //        UPDATE COMMENT
  // ============================
  @Put(':commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Req() req: any,
    @Body() dto: UpdateCommentDto,
  ) {
    const userId = req.user._id;
    return this.commentsService.updateComment(commentId, userId, dto);
  }

  // ============================
  //        DELETE COMMENT
  // ============================
  @Delete(':commentId')
  async deleteComment(@Param('commentId') commentId: string, @Req() req: any) {
    const userId = req.user._id;
    return this.commentsService.deleteComment(commentId, userId);
  }
}
