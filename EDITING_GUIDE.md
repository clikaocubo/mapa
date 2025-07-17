# Guia de Edição Manual

Este guia explica como editar manualmente o arquivo `rooms_data.json` para gerenciar as salas do mapa interativo.

## Estrutura do Arquivo

O arquivo `rooms_data.json` tem a seguinte estrutura:

```json
{
  "rooms": [
    {
      "id": "sala1",
      "nome": "Sala 1",
      "status": "ativo",
      "capacidade": 30,
      "ocupacao": 15,
      "temperatura": 22,
      "descricao": "Sala de reuniões principal",
      "responsavel": "João Silva",
      "title": "Sala 1",
      "speaker": "Palestrante",
      "timeStatus": "on-time",
      "startTime": "09:00",
      "endTime": "10:00",
      "palestrante": "Palestrante",
      "statusTempo": "No horário",
      "horarioInicio": "09:00",
      "horarioFim": "10:00",
      "ultimaAtualizacao": "2025-06-15T12:11:48.451Z"
    }
  ]
}
```

## Campos Importantes

- `id`: Identificador único da sala (não deve ser alterado)
- `status`: Pode ser "ativo" ou "inativo"
- `nome`: Nome de exibição da sala
- `capacidade`: Número máximo de pessoas
- `ocupacao`: Número atual de pessoas na sala
- `descricao`: Descrição da sala
- `responsavel`: Nome do responsável
- `speaker`/`palestrante`: Nome do palestrante atual
- `timeStatus`: "on-time" ou "late"
- `startTime`/`endTime`: Horário de início e fim (formato HH:MM)
- `horarioInicio`/`horarioFim`: Horário em português (formato HH:MM)
- `ultimaAtualizacao`: Data e hora da última atualização (atualizado automaticamente)

## Como Editar

1. Pare o servidor se estiver em execução
2. Abra o arquivo `rooms_data.json` em um editor de texto
3. Faça as alterações desejadas
4. Salve o arquivo
5. Reinicie o servidor ou acesse `/api/reload` para recarregar os dados

## Rotas Úteis

- `GET /api/rooms`: Lista todas as salas
- `GET /api/reload`: Recarrega os dados do arquivo `rooms_data.json`
- `POST /api/rooms/:id`: Atualiza uma sala específica

## Dicas

- Sempre faça backup do arquivo antes de editar
- Verifique a sintaxe JSON após editar (use um validador JSON)
- Se o servidor não iniciar, verifique os logs em busca de erros de sintaxe
- Campos vazios ou ausentes podem causar erros na aplicação

## Exemplo de Atualização

Para desativar uma sala, altere:
```json
{
  "status": "inativo"
}
```

Para atualizar o palestrante e horário:
```json
{
  "palestrante": "Novo Palestrante",
  "speaker": "Novo Palestrante",
  "horarioInicio": "14:00",
  "horarioFim": "15:30",
  "startTime": "14:00",
  "endTime": "15:30"
}
```
