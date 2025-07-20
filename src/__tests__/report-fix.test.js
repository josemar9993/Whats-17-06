// Test to verify all fixes for the daily report zero values issue
const { describe, test, expect, beforeEach } = require('@jest/globals');
const { createDailySummary } = require('../summarizer');

describe('Daily Report Zero Values Fix', () => {
  describe('createDailySummary', () => {
    test('should handle empty messages array', async () => {
      const result = await createDailySummary([]);
      expect(result).toContain('❌ Nenhuma atividade registrada');
    });

    test('should generate proper report with business messages', async () => {
      const baseTime = Math.floor(Date.now() / 1000);
      const messages = [
        {
          id: 'msg1',
          chatId: '5511987654321@c.us',
          timestamp: baseTime - 3600,
          senderName: 'Cliente João',
          type: 'chat',
          body: 'Preciso de ajuda com o sistema. Erro crítico!',
          fromMe: false
        },
        {
          id: 'msg2',
          chatId: '5511987654321@c.us',
          timestamp: baseTime - 3500,
          senderName: 'Suporte',
          type: 'chat',
          body: 'Olá! Vou ajudar você. Qual o erro?',
          fromMe: true
        },
        {
          id: 'msg3',
          chatId: '5511123456789@c.us',
          timestamp: baseTime - 2700,
          senderName: 'Cliente Maria',
          type: 'chat',
          body: 'Preciso de um orçamento para desenvolvimento web',
          fromMe: false
        },
        {
          id: 'msg4',
          chatId: '5511555666777@c.us',
          timestamp: baseTime - 1800,
          senderName: 'Cliente Pedro',
          type: 'chat',
          body: 'Quando vence o boleto do projeto?',
          fromMe: false
        }
      ];

      const result = await createDailySummary(messages, 'TESTE');
      
      // Check that report contains proper metrics
      expect(result).toContain('RELATÓRIO EMPRESARIAL DIÁRIO');
      expect(result).toContain('Conversas Ativas:** 3');
      expect(result).toContain('Mensagens Enviadas:** 1');
      expect(result).toContain('Mensagens Recebidas:** 3');
      expect(result).toContain('Taxa de Resposta Geral:');
      expect(result).toContain('TÓPICOS EMPRESARIAIS');
      expect(result).toContain('Suporte Técnico');
      expect(result).toContain('Financeiro');
      expect(result).toContain('Desenvolvimento');
      
      // Check that it doesn't contain zero values error
      expect(result).not.toContain('❌ Nenhuma atividade registrada');
    });

    test('should detect critical alerts correctly', async () => {
      const baseTime = Math.floor(Date.now() / 1000);
      const messages = [
        {
          id: 'msg1',
          chatId: '5511999000111@c.us',
          timestamp: baseTime - 900,
          senderName: 'Cliente Crítico',
          type: 'chat',
          body: 'URGENTE! O servidor está fora do ar. Sistema crítico parado!',
          fromMe: false
        }
      ];

      const result = await createDailySummary(messages, 'TESTE');
      
      expect(result).toContain('ALERTAS CRÍTICOS');
      expect(result).toContain('CONTATO(S) CRÍTICO(S)');
      expect(result).toContain('SEM RESPOSTA');
      expect(result).toContain('Suporte Técnico');
    });

    test('should calculate performance metrics correctly', async () => {
      const baseTime = Math.floor(Date.now() / 1000);
      const messages = [
        {
          id: 'msg1',
          chatId: '5511987654321@c.us',
          timestamp: baseTime - 3600,
          senderName: 'Cliente A',
          type: 'chat',
          body: 'Mensagem 1',
          fromMe: false
        },
        {
          id: 'msg2',
          chatId: '5511987654321@c.us',
          timestamp: baseTime - 3500,
          senderName: 'Atendente',
          type: 'chat',
          body: 'Resposta 1',
          fromMe: true
        },
        {
          id: 'msg3',
          chatId: '5511123456789@c.us',
          timestamp: baseTime - 2700,
          senderName: 'Cliente B',
          type: 'chat',
          body: 'Mensagem 2',
          fromMe: false
        },
        {
          id: 'msg4',
          chatId: '5511123456789@c.us',
          timestamp: baseTime - 2600,
          senderName: 'Atendente',
          type: 'chat',
          body: 'Resposta 2',
          fromMe: true
        }
      ];

      const result = await createDailySummary(messages, 'TESTE');
      
      expect(result).toContain('Taxa de Engajamento:** 100%');
      expect(result).toContain('Conversas Ativas:** 2');
      expect(result).toContain('Mensagens Enviadas:** 2');
      expect(result).toContain('Mensagens Recebidas:** 2');
      expect(result).toContain('Taxa de Resposta Geral:** 100%');
    });

    test('should handle timezone and date formatting', async () => {
      const baseTime = Math.floor(Date.now() / 1000);
      const messages = [
        {
          id: 'msg1',
          chatId: '5511987654321@c.us',
          timestamp: baseTime - 3600,
          senderName: 'Cliente',
          type: 'chat',
          body: 'Teste de timezone',
          fromMe: false
        }
      ];

      const result = await createDailySummary(messages, 'HOJE (15/07/2025)');
      
      expect(result).toContain('HOJE (15/07/2025)');
      expect(result).toContain('Relatório gerado automaticamente');
      expect(result).toContain('Sistema: WhatsApp Business Intelligence v2.0');
    });
  });
});