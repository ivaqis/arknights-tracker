<script>
  import { createEventDispatcher } from "svelte";
  import { scale } from "svelte/transition";
  import { t } from "$lib/i18n.js";
  import { browser } from "$app/environment";
  import { addNotification } from "$lib/stores/notifications";

  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Modal from "$lib/components/modals/Modal.svelte";
  import ConfirmationModal from "$lib/components/modals/ConfirmationModal.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  let pullsSize = 0;
  let potentialsSize = 0;
  let avatarSize = 0;
  let preferencesSize = 0;
  let otherLocalStorageSize = 0;
  let imageCacheSize = 0;

  let showClearAllConfirm = false;
  let showClearCategoryConfirm = false;
  let categoryToClear = null;

  $: if (isOpen && browser) {
    calculateStorage();
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function isPullKey(key) {
    return (
      key.startsWith("ark_tracker_") ||
      key.startsWith("ark_accounts") ||
      key.startsWith("ark_pulls") ||
      key.startsWith("headhunt_") ||
      key.startsWith("saved_accounts") ||
      key.includes("token") ||
      key === "ark_active_uid" ||
      key === "ark_last_sync" ||
      key === "ark_local_last_modified" ||
      key === "user_uid"
    );
  }

  function isPotentialKey(key) {
    return (
      key.includes("operatorPotentials") ||
      key.includes("custom_weapon_essence") ||
      key.includes("weaponEssences")
    );
  }

  function isAvatarKey(key) {
    return (
      key.includes("goyfield_local_avatar") ||
      key.includes("goyfield_favorite") ||
      key.includes("goyfield_splash")
    );
  }

  function isPrefKey(key) {
    return (
      key === "theme" ||
      key.includes("sidebar") ||
      key.includes("Mode") ||
      key.includes("Params") ||
      key.includes("records") ||
      key.includes("server") ||
      key.includes("locale") ||
      key.includes("Darkening") ||
      key.includes("Zoom") ||
      key.includes("split") ||
      key.includes("sub_") ||
      key.includes("cookie") ||
      key.includes("PotHint") ||
      key.includes("useServerTime")
    );
  }

  async function calculateStorage() {
    if (!browser) return;

    pullsSize = 0;
    potentialsSize = 0;
    avatarSize = 0;
    preferencesSize = 0;
    otherLocalStorageSize = 0;
    imageCacheSize = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const val = localStorage.getItem(key) || "";
        const bytes = new Blob([key + val]).size;

        if (isPullKey(key)) {
          pullsSize += bytes;
        } else if (isPotentialKey(key)) {
          potentialsSize += bytes;
        } else if (isAvatarKey(key)) {
          avatarSize += bytes;
        } else if (isPrefKey(key)) {
          preferencesSize += bytes;
        } else {
          otherLocalStorageSize += bytes;
        }
      }

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const requests = await cache.keys();
          for (const req of requests) {
            try {
              const res = await cache.match(req);
              if (res) {
                const blob = await res.blob();
                imageCacheSize += blob.size;
              }
            } catch (e) {}
          }
        }
      }

      if (imageCacheSize === 0 && typeof window !== "undefined" && "performance" in window) {
        const resources = performance.getEntriesByType("resource");
        for (const res of resources) {
          if (res.initiatorType === "img" || (res.name && res.name.match(/\.(webp|png|jpg|jpeg|svg|gif)($|\?)/i))) {
            imageCacheSize += res.transferSize || res.encodedBodySize || res.decodedBodySize || 0;
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  function promptClearCategory(cat) {
    categoryToClear = cat;
    showClearCategoryConfirm = true;
  }

  async function confirmClearCategory() {
    if (!browser || !categoryToClear) return;
    try {
      if (categoryToClear.id === "images") {
        if ("caches" in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
      } else {
        const filterFn =
          categoryToClear.id === "pulls" ? isPullKey :
          categoryToClear.id === "potentials" ? isPotentialKey :
          categoryToClear.id === "avatar" ? isAvatarKey :
          categoryToClear.id === "preferences" ? isPrefKey :
          (key) => !isPullKey(key) && !isPotentialKey(key) && !isAvatarKey(key) && !isPrefKey(key);

        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && filterFn(key)) {
            localStorage.removeItem(key);
          }
        }
      }
      addNotification(
        "success",
        $t("settings.cache.successClearCategory").replace("{name}", categoryToClear.title)
      );
      await calculateStorage();
    } catch (e) {
      console.error(e);
    } finally {
      showClearCategoryConfirm = false;
      categoryToClear = null;
    }
  }

  async function clearAll() {
    if (!browser) return;
    try {
      localStorage.clear();
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      addNotification("success", $t("settings.cache.successClearAll"));
      await calculateStorage();
    } catch (e) {
      console.error(e);
    } finally {
      showClearAllConfirm = false;
    }
  }

  function onClose() {
    dispatch("close");
  }

  function formatPercent(pct) {
    if (pct <= 0) return "";
    if (pct === 100) return "100%";
    if (pct < 1) return "<1%";
    if (pct >= 99 && pct < 100) return "99%";
    return Math.round(pct) + "%";
  }

  $: totalCalculated = pullsSize + potentialsSize + avatarSize + preferencesSize + otherLocalStorageSize + imageCacheSize;

  $: categories = [
    {
      id: "pulls",
      title: $t("settings.cache.pulls"),
      desc: $t("settings.cache.pullsDesc"),
      size: pullsSize,
      percent: totalCalculated > 0 ? (pullsSize / totalCalculated) * 100 : 0,
      colorBg: "bg-blue-500/10 dark:bg-blue-950/30",
      colorBorder: "border-blue-200 dark:border-blue-800/60",
      colorDot: "bg-blue-500"
    },
    {
      id: "images",
      title: $t("settings.cache.images"),
      desc: $t("settings.cache.imagesDesc"),
      size: imageCacheSize,
      percent: totalCalculated > 0 ? (imageCacheSize / totalCalculated) * 100 : 0,
      colorBg: "bg-emerald-500/10 dark:bg-emerald-950/30",
      colorBorder: "border-emerald-200 dark:border-emerald-800/60",
      colorDot: "bg-emerald-500"
    },
    {
      id: "potentials",
      title: $t("settings.cache.potentials"),
      desc: $t("settings.cache.potentialsDesc"),
      size: potentialsSize,
      percent: totalCalculated > 0 ? (potentialsSize / totalCalculated) * 100 : 0,
      colorBg: "bg-purple-500/10 dark:bg-purple-950/30",
      colorBorder: "border-purple-200 dark:border-purple-800/60",
      colorDot: "bg-purple-500"
    },
    {
      id: "avatar",
      title: $t("settings.cache.avatar"),
      desc: $t("settings.cache.avatarDesc"),
      size: avatarSize,
      percent: totalCalculated > 0 ? (avatarSize / totalCalculated) * 100 : 0,
      colorBg: "bg-pink-500/10 dark:bg-pink-950/30",
      colorBorder: "border-pink-200 dark:border-pink-800/60",
      colorDot: "bg-pink-500"
    },
    {
      id: "preferences",
      title: $t("settings.cache.preferences"),
      desc: $t("settings.cache.preferencesDesc"),
      size: preferencesSize,
      percent: totalCalculated > 0 ? (preferencesSize / totalCalculated) * 100 : 0,
      colorBg: "bg-amber-500/10 dark:bg-amber-950/30",
      colorBorder: "border-amber-200 dark:border-amber-800/60",
      colorDot: "bg-amber-500"
    },
    {
      id: "other",
      title: $t("settings.cache.other"),
      desc: $t("settings.cache.otherDesc"),
      size: otherLocalStorageSize,
      percent: totalCalculated > 0 ? (otherLocalStorageSize / totalCalculated) * 100 : 0,
      colorBg: "bg-slate-500/10 dark:bg-slate-800/40",
      colorBorder: "border-slate-200 dark:border-slate-700/60",
      colorDot: "bg-slate-400"
    }
  ].sort((a, b) => b.size - a.size);
</script>

<Modal {isOpen} closeOnOutsideClick={true} on:close={onClose}>
  <div
    class="relative bg-white rounded-2xl dark:bg-[#383838] dark:border-[#444444] p-6 w-full max-w-2xl shadow-2xl border border-gray-100 cursor-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
    transition:scale={{ duration: 200, start: 0.95 }}
  >
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold font-sdk dark:text-[#FDFDFD] text-[#21272C]">
        {$t("settings.cache.modalTitle")}
      </h3>
      <button
        on:click={onClose}
        class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1"
      >
        ✕
      </button>
    </div>

    <div class="bg-gray-50 dark:bg-[#2C2C2C] p-4 rounded-xl mb-4 border border-gray-100 dark:border-[#444]">
      <div class="flex items-center justify-between text-sm mb-2.5">
        <span class="font-bold text-gray-700 dark:text-[#E0E0E0]">{$t("settings.cache.totalUsage")}</span>
        <span class="font-mono font-bold text-base text-[#21272C] dark:text-[#FDFDFD]">
          {$t("settings.cache.used")}: {formatBytes(totalCalculated)}
        </span>
      </div>

      <div class="w-full bg-gray-200 dark:bg-[#444] h-2.5 rounded-full overflow-hidden flex">
        {#each categories as cat (cat.id)}
          {#if cat.percent > 0}
            <div
              class="{cat.colorDot} h-full transition-all duration-300"
              style="width: {cat.percent}%"
              title="{cat.title}: {formatBytes(cat.size)}"
            ></div>
          {/if}
        {/each}
      </div>
    </div>

    <div class="mb-4">
      <h4 class="text-sm font-bold text-gray-800 dark:text-[#E0E0E0] mb-3">
        {$t("settings.cache.categories")}
      </h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        {#each categories as cat (cat.id)}
          <div
            class="p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden {cat.colorBg} {cat.colorBorder} {cat.size === 0 ? 'opacity-50 hover:opacity-100' : ''}"
          >
            <div>
              <div class="flex items-start justify-between gap-2 mb-1.5">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="w-2.5 h-2.5 rounded-full {cat.colorDot} shrink-0 mt-0.5"></span>
                  <span class="text-sm font-bold text-gray-900 dark:text-white leading-snug whitespace-normal break-words">
                    {cat.title}
                  </span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  {#if cat.percent > 0}
                    <span class="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                      {formatPercent(cat.percent)}
                    </span>
                  {/if}
                  {#if cat.size > 0}
                    <Tooltip
                      text={$t("settings.cache.confirmClearCategory").replace("{name}", cat.title)}
                    >
                      <button
                        type="button"
                        on:click={() => promptClearCategory(cat)}
                        class="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-all"
                      >
                        <Icon name="trash" class="w-4 h-4" />
                      </button>
                    </Tooltip>
                  {/if}
                </div>
              </div>

              <p class="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                {cat.desc}
              </p>
            </div>

            <div class="flex items-baseline justify-end mt-auto pt-1 border-t border-black/5 dark:border-white/5">
              <span class="text-sm font-mono font-black text-gray-900 dark:text-white">{formatBytes(cat.size)}</span>
            </div>

            {#if cat.percent > 0}
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
                <div class="h-full {cat.colorDot} opacity-70" style="width: {cat.percent}%"></div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <div class="mb-6">
      <h4 class="text-sm font-bold text-gray-800 dark:text-[#E0E0E0] mb-3">
        {$t("settings.cache.actions")}
      </h4>

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#2C2C2C] rounded-xl border border-gray-100 dark:border-[#444]">
          <div class="pr-2">
            <div class="text-sm font-bold text-[#21272C] dark:text-[#FDFDFD]">{$t("settings.cache.clearAll")}</div>
            <div class="text-xs text-gray-500 dark:text-[#B7B6B3]">{$t("settings.cache.clearAllDesc")}</div>
          </div>
          <div class="w-auto shrink-0">
            <Button variant="round" color="red" onClick={() => (showClearAllConfirm = true)}>
              {$t("settings.cache.confirmClearCategory")}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end pt-2 border-t border-gray-100 dark:border-[#444]">
      <div class="w-auto">
        <Button variant="round" color="yellow" onClick={onClose}>
          {$t("privacy.close")}
        </Button>
      </div>
    </div>
  </div>
</Modal>

<ConfirmationModal
  isOpen={showClearCategoryConfirm}
  title={$t("settings.cache.confirmClearCategory").replace("{name}", categoryToClear ? categoryToClear.title : "")}
  description={$t("settings.cache.confirmClearCategoryDesc").replace("{name}", categoryToClear ? categoryToClear.title : "")}
  confirmText={$t("settings.cache.confirmClearCategory").replace("{name}", categoryToClear ? categoryToClear.title : "")}
  isDestructive={true}
  confirmColor="red"
  on:close={() => {
    showClearCategoryConfirm = false;
    categoryToClear = null;
  }}
  on:confirm={confirmClearCategory}
/>

<ConfirmationModal
  isOpen={showClearAllConfirm}
  title={$t("settings.cache.confirmClearAll")}
  description={$t("settings.cache.confirmClearAllDesc")}
  confirmText={$t("settings.cache.clearAll")}
  isDestructive={true}
  confirmColor="red"
  on:close={() => (showClearAllConfirm = false)}
  on:confirm={clearAll}
/>
