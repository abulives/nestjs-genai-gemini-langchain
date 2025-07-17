import { Controller, Post, Body, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { QaService } from './qa.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';

@Controller('qa')
export class QaController {
    constructor(private readonly qaService: QaService) { }

    @Post('upload_files')
    @UseInterceptors(FilesInterceptor('files', 100,{ dest: './uploads' }))
    async uploadMultipleFiles(@UploadedFiles() files: any) {
        await this.qaService.uploadPDFs(files);
        for (const file of files) { fs.unlink(file.path, (err) => { }); }
        return { message: 'PDFs processed successfully' };
    }

    @Post('ask_question')
     async askQuestion(@Body('question') question: string) {
        if (!question) {
            return { error: 'question parameter "question" is required' };
        }
        const answer = await this.qaService.askQuestions(question);
        return answer;
    }
}
