import { Injectable } from '@nestjs/common';
import 'dotenv/config'
import { File as MulterFile } from 'multer';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
const apiKey = process.env.GOOGLE_API_KEY;
const embeddings = new GoogleGenerativeAIEmbeddings({ model: "models/embedding-001",apiKey });

const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.0-flash',
    apiKey,
    temperature: 0.3,
});
@Injectable()
export class QaService {
    
    async getPdfText(files: any) {
        try {
            const docs: any= [];
            for (const file of files) {
                const loader = new PDFLoader(file.path);
                const fileDocs = await loader.load();
                docs.push(...fileDocs);
            }
            return docs;
        } catch (error) {
            throw error;
        }
        
    }
    async getTextChunks(docs: any[]) {
        try {
            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200,
            });
            return await textSplitter.splitDocuments(docs);
        } catch (error) {
            throw error;
        }

    }
    async saveVectorStore(textChunks: any[]) {
        try {
            const vectorStore = await FaissStore.fromDocuments(textChunks, embeddings);
            const vectorname = 'uploaded_vectors';
            await vectorStore.save(`vectors/${vectorname}`);
            return;
        } catch (error) {
            throw error;
        }
    }
    async getConversationalChain() {
        return async ({ input_documents = [], question }: { input_documents?: { pageContent: string }[], question: string }) => {
            const context = input_documents.map(doc => doc.pageContent).join('\n');

            const systemTemplate:any = [
                ['system', `Answer the user's questions based on the below context:\n\n{context}, don't provide the wrong answer`],
                ["user", `{text}`]
            ];
            const promptTemplate = ChatPromptTemplate.fromMessages(systemTemplate);
            try {
                const promptValue  = await promptTemplate.invoke({
                    text: question, context: context
                });
                
                const response = await model.invoke(promptValue);
                return { output_text: response.content };
            } catch (error) {
                console.error("Error calling the model:", error.message);
                throw error;
            }
        };
    }
    async userInput(question: string) {
        try {
            const vectorname = 'uploaded_vectors';
            const vectorStore = await FaissStore.load(`vectors/${vectorname}`, embeddings);
            const docs = await vectorStore.similaritySearch(question);
            const chain = await this.getConversationalChain();
            const response = await chain({
                input_documents: docs,
                question: question
            });
            return response;
        } catch (error) {
            console.error("Error loading vector store:", error.message);
            throw error;
        }
    }
    async uploadPDFs(files: MulterFile[]) {
        const rawText = await this.getPdfText(files);
        const textChunks = await this.getTextChunks(rawText);
        await this.saveVectorStore(textChunks);
        return true;
    }
    async askQuestions(question: string): Promise<{ success: boolean; response?: string; error?: string }> {
        try {
            const response = await this.userInput(question);
            const output =
                Array.isArray(response.output_text)
                    ? response.output_text.map((item: any) => typeof item === 'string' ? item : JSON.stringify(item)).join('\n')
                    : response.output_text;
            return { success: true, response: output };
        }catch(err){
            console.error('Error in getQuestions:', err);
            return { success: false, error: err.message || 'An error occurred' };
        }
    }
}
