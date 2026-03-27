<script setup>
import { computed, ref } from 'vue'

const gender = ref('male') // 'male' | 'female'
const age = ref(30)
const weightKg = ref(70)
const heightCm = ref(170)
const activity = ref('moderate') // activity multiplier key
const goal = ref('maintain') // 'maintain' | 'lose' | 'gain'

const error = ref('')
const status = ref('') // 顯示按下「計算」後的回饋
const statusAnimKey = ref(0) // 用於重觸發動畫（避免連續點不更新畫面）

const activityMultipliers = {
  sedentary: 1.2, // 久坐
  light: 1.375, // 輕度活動（每週 1-3 天）
  moderate: 1.55, // 中度活動（每週 3-5 天）
  very: 1.725, // 高度活動（每週 6-7 天）
  extra: 1.9 // 非常高強度（體力工作/訓練很重）
}

const goalAdjustments = {
  maintain: 0, // 維持
  lose: -0.15, // 減脂：-15%
  gain: 0.1 // 增肌：+10%
}

function toNumber(v) {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : NaN
}

const bmr = computed(() => {
  const a = toNumber(age.value)
  const w = toNumber(weightKg.value)
  const h = toNumber(heightCm.value)
  if (!Number.isFinite(a) || !Number.isFinite(w) || !Number.isFinite(h)) return NaN

  if (gender.value === 'male') {
    // Mifflin-St Jeor (男性)
    return 10 * w + 6.25 * h - 5 * a + 5
  }

  // Mifflin-St Jeor (女性)
  return 10 * w + 6.25 * h - 5 * a - 161
})

const tdee = computed(() => {
  const mult = activityMultipliers[activity.value]
  const adjust = goalAdjustments[goal.value]
  if (!Number.isFinite(mult) || !Number.isFinite(adjust)) return NaN

  const b = bmr.value
  if (!Number.isFinite(b)) return NaN
  // 先算維持熱量，再套用目標調整
  return b * mult * (1 + adjust)
})

const recommendedCalories = computed(() => {
  const n = tdee.value
  if (!Number.isFinite(n)) return ''
  return Math.round(n).toString()
})

function validate() {
  error.value = ''

  const a = toNumber(age.value)
  const w = toNumber(weightKg.value)
  const h = toNumber(heightCm.value)
  if (!Number.isFinite(a) || a <= 0) return '年齡必須是大於 0 的數字。'
  if (!Number.isFinite(w) || w <= 0) return '體重必須是大於 0 的數字（kg）。'
  if (!Number.isFinite(h) || h <= 0) return '身高必須是大於 0 的數字（cm）。'

  if (!activityMultipliers[activity.value]) return '請選擇正確的活動量。'
  if (goal.value !== 'maintain' && goal.value !== 'lose' && goal.value !== 'gain') return '請選擇正確的目標。'
  return ''
}

function onCalculate() {
  const msg = validate()
  if (msg) {
    error.value = msg
    status.value = ''
    return
  }
  // 其餘值由 computed 自動更新
  error.value = ''
  status.value = '計算完成'
  statusAnimKey.value += 1
}
</script>

<template>
  <main>
    <h1>熱量計算機</h1>

    <section class="card">
      <form class="grid" @submit.prevent="onCalculate">
        <label>
          性別
          <select v-model="gender">
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </label>

        <label>
          年齡
          <input v-model.number="age" type="number" min="1" step="1" />
        </label>

        <label>
          體重（kg）
          <input v-model.number="weightKg" type="number" min="1" step="0.1" />
        </label>

        <label>
          身高（cm）
          <input v-model.number="heightCm" type="number" min="1" step="0.1" />
        </label>

        <label>
          活動量
          <select v-model="activity">
            <option value="sedentary">久坐（1.2）</option>
            <option value="light">輕度活動（1.375）</option>
            <option value="moderate">中度活動（1.55）</option>
            <option value="very">高度活動（1.725）</option>
            <option value="extra">非常高強度（1.9）</option>
          </select>
        </label>

        <label>
          目標
          <select v-model="goal">
            <option value="maintain">維持（0%）</option>
            <option value="lose">減脂（-15%）</option>
            <option value="gain">增肌（+10%）</option>
          </select>
        </label>

        <div class="actions">
          <button class="primary" type="submit">計算</button>
        </div>
      </form>

      <div
        v-if="status"
        :key="statusAnimKey"
        class="status"
        role="status"
        aria-live="polite"
      >
        {{ status }}
      </div>

      <div v-if="error" class="error" role="alert">
        {{ error }}
      </div>
    </section>

    <section class="card results">
      <h2>計算結果</h2>
      <div class="result-row">
        <div class="label">BMR（基礎代謝）</div>
        <div class="value">{{ Number.isFinite(bmr) ? Math.round(bmr) : '-' }} kcal/day</div>
      </div>
      <div class="result-row">
        <div class="label">TDEE（每日消耗）</div>
        <div class="value">{{ Number.isFinite(tdee) ? Math.round(tdee) : '-' }} kcal/day</div>
      </div>
      <div class="result-row highlight">
        <div class="label">建議熱量</div>
        <div class="value">{{ recommendedCalories ? recommendedCalories : '-' }} kcal/day</div>
      </div>

      <p class="note">
        熱量計算使用 Mifflin-St Jeor 公式（BMR）與活動係數（TDEE），並依目標做比例調整。
      </p>
    </section>
  </main>
</template>

<style scoped>
main {
  padding: 24px 20px 60px;
  max-width: 860px;
  margin: 0 auto;
}

h1 {
  margin: 10px 0 18px;
  font-size: 36px;
}

.card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.55);
  box-shadow: var(--shadow);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
  align-items: end;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: var(--text-h);
}

input,
select {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 16px;
  background: var(--bg);
  color: var(--text-h);
}

.actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-start;
  margin-top: 4px;
}

button {
  cursor: pointer;
  border-radius: 10px;
  padding: 12px 16px;
  border: 1px solid var(--accent-border);
  background: var(--accent-bg);
  color: var(--text-h);
  font-weight: 600;
}

button:hover {
  background: rgba(170, 59, 255, 0.18);
}

.results h2 {
  margin: 0 0 12px;
  font-size: 22px;
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 10px 0;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}

.result-row:first-of-type {
  border-top: none;
}

.result-row .label {
  color: var(--text);
}

.result-row .value {
  font-weight: 700;
  color: var(--text-h);
}

.result-row.highlight {
  margin-top: 8px;
  border-top: 1px solid var(--border);
}

.error {
  margin-top: 12px;
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.35);
  padding: 12px;
  border-radius: 10px;
}

.status {
  margin-top: 12px;
  color: var(--text-h);
  font-weight: 600;
  font-size: 14px;
  display: inline-block;
  transform-origin: center center; /* 避免 scale 看起來位移 */
  will-change: transform;
  animation: statusPulse 3s ease-in-out;
}

@keyframes statusPulse {
  0% {
    transform: scale(1);
    color: var(--text-h);
  }
  35% {
    transform: scale(1.15);
    color: #3b82f6; /* blue */
  }
  100% {
    transform: scale(1);
    color: var(--text-h);
  }
}

.note {
  margin: 12px 0 0;
  color: var(--text);
  font-size: 13px;
}
</style>
