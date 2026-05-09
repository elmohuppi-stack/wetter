export default {
  props: {
    currentTab: String,
    darkMode: Boolean,
  },
  emits: ["tab-change"],
  data() {
    return {
      tabs: [
        { id: "forecast", label: "Forecast", icon: "📊" },
        { id: "historical", label: "Historical", icon: "📈" },
        { id: "seasonal", label: "Seasonal", icon: "🌡️" },
        { id: "climate", label: "Climate", icon: "🌍" },
        { id: "dashboard", label: "Dashboard", icon: "📱" },
        { id: "expert", label: "Expert", icon: "👨‍🔬" },
      ],
    };
  },
  template: `
    <aside :class="['fixed left-0 top-16 bottom-0 w-32 overflow-y-auto transition-colors p-0', darkMode ? 'bg-slate-800 border-slate-700 text-gray-300' : 'bg-slate-50 border-slate-200 text-gray-900', 'border-r']">
      <nav class="flex min-h-full flex-col py-5">
        <div>
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="$emit('tab-change', tab.id)"
            :class="[
              'w-full px-2 py-2.5 border-none text-center cursor-pointer text-xs font-medium transition-all flex items-center justify-center gap-0 whitespace-nowrap overflow-hidden text-ellipsis',
              currentTab === tab.id
                ? 'bg-purple-600 text-white border-l-4 border-violet-700'
                : 'bg-transparent hover:' + (darkMode ? 'bg-slate-700' : 'bg-slate-100')
            ]"
          >
            <span class="hidden">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
        </div>
        <div class="mt-auto px-3 py-4 border-t" :class="darkMode ? 'border-slate-700' : 'border-slate-200'">
          <a href="/impressum.html" :class="['block text-center text-xs py-1.5 rounded transition-colors', darkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-slate-100']">Impressum</a>
          <a href="/datenschutz.html" :class="['block text-center text-xs py-1.5 rounded transition-colors', darkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-slate-100']">Datenschutz</a>
        </div>
      </nav>
    </aside>
  `,
};
