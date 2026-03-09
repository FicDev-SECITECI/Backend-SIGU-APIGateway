#!/usr/bin/env node

/**
 * Script de teste para validar o sistema de autenticação
 * Uso: node test-auth.js
 */

const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'
const ADMIN_CREDENTIALS = {
   email: 'admin@example.com',
   password: 'admin123',
}

async function testAuthentication() {
   console.log('🧪 Iniciando testes de autenticação...\n')

   try {
      // Teste 1: Login do admin
      console.log('1. Testando login do admin...')
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS)
      const token = loginResponse.data.token
      console.log('✅ Login bem-sucedido')
      console.log(`   Token: ${token.substring(0, 20)}...\n`)

      // Teste 2: Acesso à rota de usuários
      console.log('2. Testando acesso à rota /users...')
      const usersResponse = await axios.get(`${BASE_URL}/users`, {
         headers: { Authorization: `Bearer ${token}` },
      })
      console.log('✅ Acesso à rota de usuários bem-sucedido')
      console.log(`   Total de usuários: ${usersResponse.data.users.length}\n`)

      // Teste 3: Acesso ao perfil
      console.log('3. Testando acesso ao perfil...')
      const profileResponse = await axios.get(`${BASE_URL}/profile`, {
         headers: { Authorization: `Bearer ${token}` },
      })
      console.log('✅ Acesso ao perfil bem-sucedido')
      console.log(`   Usuário: ${profileResponse.data.username} (${profileResponse.data.email})\n`)

      // Teste 4: Acesso ao dashboard
      console.log('4. Testando acesso ao dashboard...')
      const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, {
         headers: { Authorization: `Bearer ${token}` },
      })
      console.log('✅ Acesso ao dashboard bem-sucedido')
      console.log(`   Mensagem: ${dashboardResponse.data.message}\n`)

      // Teste 5: Acesso à rota admin-only
      console.log('5. Testando acesso à rota admin-only...')
      const adminResponse = await axios.get(`${BASE_URL}/admin-only`, {
         headers: { Authorization: `Bearer ${token}` },
      })
      console.log('✅ Acesso à rota admin-only bem-sucedido')
      console.log(`   Mensagem: ${adminResponse.data.message}\n`)

      // Teste 6: Tentativa de login com credenciais inválidas
      console.log('6. Testando login com credenciais inválidas...')
      try {
         await axios.post(`${BASE_URL}/auth/login`, {
            email: 'invalid@example.com',
            password: 'wrongpassword',
         })
         console.log('❌ Falha: Deveria ter retornado erro 401')
      } catch (error) {
         if (error.response.status === 401) {
            console.log('✅ Login inválido corretamente bloqueado')
            console.log(`   Mensagem: ${error.response.data.error}\n`)
         } else {
            console.log('❌ Falha: Status inesperado')
         }
      }

      // Teste 7: Tentativa de acesso sem token
      console.log('7. Testando acesso sem token...')
      try {
         await axios.get(`${BASE_URL}/users`)
         console.log('❌ Falha: Deveria ter retornado erro 401')
      } catch (error) {
         if (error.response.status === 401) {
            console.log('✅ Acesso sem token corretamente bloqueado')
            console.log(`   Mensagem: ${error.response.data.error}\n`)
         } else {
            console.log('❌ Falha: Status inesperado')
         }
      }

      // Teste 8: Registro de novo usuário
      console.log('8. Testando registro de novo usuário...')
      const newUser = {
         username: 'testuser',
         email: 'test@example.com',
         password: 'Test123@',
         role: 'user',
      }

      try {
         const registerResponse = await axios.post(`${BASE_URL}/auth/register`, newUser)
         console.log('✅ Registro bem-sucedido')
         console.log(`   Usuário: ${registerResponse.data.user.username}\n`)
      } catch (error) {
         console.log(`❌ Falha no registro: ${error.response.data.error}`)
      }

      console.log('🎉 Todos os testes concluídos com sucesso!')
   } catch (error) {
      console.error('❌ Erro durante os testes:', error.message)
      if (error.response) {
         console.error('Status:', error.response.status)
         console.error('Resposta:', error.response.data)
      }
   }
}

// Executar testes se este script for executado diretamente
if (require.main === module) {
   testAuthentication()
}

module.exports = { testAuthentication }
