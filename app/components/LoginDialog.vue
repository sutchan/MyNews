<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Phone, 
  Github, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  X 
} from 'lucide-vue-next'
import { Weixin } from 'lucide-vue-next'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import { useAuth } from '@/composables/useAuth'

interface LoginDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const props = withDefaults(defineProps<LoginDialogProps>(), {
  open: false
})

const emit = defineEmits<{
  'update:open': [open: boolean]
  'open-change': [open: boolean]
}>()

const {
  authState,
  loginWithPhone,
  loginWithWechat,
  loginWithGitHub,
  logout,
  getVerificationCode
} = useAuth()

// 登录方式
const loginMethod = ref<'phone' | 'wechat' | 'github'>('phone')

// 表单数据
const phoneForm = ref({
  phone: '',
  code: '',
  countdown: 0
})

// 密码可见性
const isPasswordVisible = ref(false)

// 登录状态
const isLoggingIn = ref(false)
const errorMessage = ref('')

// 登录成功处理
const handleLoginSuccess = () => {
  errorMessage.value = ''
  // 关闭对话框
  emit('update:open', false)
  emit('open-change', false)
  // 这里可以添加登录成功后的逻辑，如显示提示信息等
}

// 处理手机号登录
const handlePhoneLogin = async () => {
  if (!phoneForm.value.phone || !phoneForm.value.code) {
    errorMessage.value = '请填写手机号和验证码'
    return
  }

  isLoggingIn.value = true
  errorMessage.value = ''

  try {
    const success = await loginWithPhone(phoneForm.value.phone, phoneForm.value.code)
    if (success) {
      handleLoginSuccess()
    } else {
      errorMessage.value = '登录失败，请检查手机号和验证码是否正确'
    }
  } catch (error) {
    errorMessage.value = '登录过程中出现错误'
    console.error('手机号登录错误:', error)
  } finally {
    isLoggingIn.value = false
  }
}

// 处理微信登录
const handleWechatLogin = async () => {
  isLoggingIn.value = true
  errorMessage.value = ''

  try {
    const success = await loginWithWechat()
    if (success) {
      handleLoginSuccess()
    } else {
      errorMessage.value = '微信登录失败'
    }
  } catch (error) {
    errorMessage.value = '微信登录过程中出现错误'
    console.error('微信登录错误:', error)
  } finally {
    isLoggingIn.value = false
  }
}

// 处理GitHub登录
const handleGitHubLogin = async () => {
  isLoggingIn.value = true
  errorMessage.value = ''

  try {
    const success = await loginWithGitHub()
    if (success) {
      handleLoginSuccess()
    } else {
      errorMessage.value = 'GitHub登录失败'
    }
  } catch (error) {
    errorMessage.value = 'GitHub登录过程中出现错误'
    console.error('GitHub登录错误:', error)
  } finally {
    isLoggingIn.value = false
  }
}

// 发送验证码
const sendVerificationCode = async () => {
  if (!phoneForm.value.phone || phoneForm.value.phone.length !== 11) {
    errorMessage.value = '请输入正确的11位手机号码'
    return
  }

  try {
    const success = await getVerificationCode(phoneForm.value.phone)
    if (success) {
      errorMessage.value = ''
      startCountdown()
    } else {
      errorMessage.value = '发送验证码失败'
    }
  } catch (error) {
    errorMessage.value = '发送验证码过程中出现错误'
    console.error('发送验证码错误:', error)
  }
}

// 开始倒计时
const startCountdown = () => {
  phoneForm.value.countdown = 60
  const timer = setInterval(() => {
    phoneForm.value.countdown--
    if (phoneForm.value.countdown <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 关闭对话框时重置表单
const handleClose = () => {
  errorMessage.value = ''
  emit('update:open', false)
  emit('open-change', false)
}

// 统一的登录处理函数
const handleLogin = () => {
  if (loginMethod.value === 'phone') {
    handlePhoneLogin()
  } else if (loginMethod.value === 'wechat') {
    handleWechatLogin()
  } else if (loginMethod.value === 'github') {
    handleGitHubLogin()
  }
}
</script>

<template>
  <Dialog :open="props.open" @open-change="(open) => emit('open-change', open)" as-child>
    <div>
      <slot name="trigger" />
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>用户登录</DialogTitle>
        </DialogHeader>
        
        <div class="py-4">
          <!-- 错误信息 -->
          <div v-if="errorMessage" class="mb-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
            <X class="h-4 w-4 flex-shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>
          
          <!-- 登录方式选择 -->
          <Tabs v-model="loginMethod" class="w-full">
            <TabsList class="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="phone" class="flex items-center gap-2">
                <Phone class="h-4 w-4" />
                <span>手机号</span>
              </TabsTrigger>
              <TabsTrigger value="wechat" class="flex items-center gap-2">
                <Wechat class="h-4 w-4" />
                <span>微信</span>
              </TabsTrigger>
              <TabsTrigger value="github" class="flex items-center gap-2">
                <Github class="h-4 w-4" />
                <span>GitHub</span>
              </TabsTrigger>
            </TabsList>
            
            <!-- 手机号登录表单 -->
            <TabsContent value="phone" class="space-y-4">
              <div class="space-y-2">
                <label for="phone" class="text-sm font-medium">手机号码</label>
                <div class="relative">
                  <Phone class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="phone"
                    v-model="phoneForm.phone"
                    type="tel"
                    placeholder="请输入手机号码"
                    class="pl-9"
                    maxlength="11"
                    :disabled="isLoggingIn"
                  />
                </div>
              </div>
              
              <div class="space-y-2">
                <label for="code" class="text-sm font-medium">验证码</label>
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="code"
                      v-model="phoneForm.code"
                      type="text"
                      placeholder="请输入验证码"
                      class="pl-9"
                      :disabled="isLoggingIn"
                    />
                  </div>
                  <Button
                    type="button"
                    @click="sendVerificationCode"
                    :disabled="isLoggingIn || phoneForm.countdown > 0 || !phoneForm.phone"
                    class="whitespace-nowrap"
                  >
                    {{ phoneForm.countdown > 0 ? `${phoneForm.countdown}秒后重发` : '获取验证码' }}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <!-- 微信登录 -->
            <TabsContent value="wechat" class="py-6 text-center">
              <div class="flex flex-col items-center space-y-4">
                <Wechat class="h-16 w-16 text-emerald-500" />
                <p class="text-sm text-muted-foreground">点击下方按钮，使用微信扫码登录</p>
              </div>
            </TabsContent>
            
            <!-- GitHub登录 -->
            <TabsContent value="github" class="py-6 text-center">
              <div class="flex flex-col items-center space-y-4">
                <Github class="h-16 w-16 text-gray-700 dark:text-gray-300" />
                <p class="text-sm text-muted-foreground">点击下方按钮，跳转到GitHub授权登录</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter class="sm:justify-between">
          <Button 
            type="button" 
            @click="handleClose"
            variant="secondary"
            :disabled="isLoggingIn"
          >
            取消
          </Button>
          
          <Button 
            type="button" 
            @click="handleLogin"
            :disabled="isLoggingIn"
          >
            {{ isLoggingIn ? '登录中...' : '登录' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </div>
  </Dialog>
</template>