/**
 * 图标动态加载工具
 * 支持从 mcp-universal-icons 获取图标
 * 优先使用内联图标缓存，离线时自动回退
 */

import { ref } from 'vue'

// 图标缓存
const iconCache = ref({})

// MCP 连接状态
let mcpClient = null

/**
 * 初始化 MCP 连接
 */
async function initMCP() {
  if (mcpClient) return mcpClient

  try {
    const { Client } = await import('@modelcontextprotocol/sdk/client/stdio.js')
    mcpClient = new Client({ name: 'icon-dynamic-loader', version: '1.0.0' }, { capabilities: {} })

    await mcpClient.connect({
      command: 'npx',
      args: ['-y', 'mcp-universal-icons']
    })

    return mcpClient
  } catch (e) {
    console.warn('MCP connection failed:', e)
    return null
  }
}

/**
 * 从 MCP 获取图标 SVG
 */
export async function fetchIconFromMCP(iconName, options = {}) {
  const { collection = 'lucide', format = 'svg' } = options
  const cacheKey = `${iconName}:${collection}`

  // 检查缓存
  if (iconCache.value[cacheKey]) {
    return iconCache.value[cacheKey]
  }

  const client = await initMCP()
  if (!client) return null

  try {
    const result = await client.callTool('get_icon', {
      icon_name: iconName,
      collection: collection,
      format: format
    })

    if (result && result[0]?.content) {
      iconCache.value[cacheKey] = result[0].content
      return result[0].content
    }
  } catch (e) {
    console.warn(`Failed to fetch icon ${iconName}:`, e)
  }

  return null
}

/**
 * 预加载常用图标
 */
export async function preloadIcons(icons, collection = 'lucide') {
  const client = await initMCP()
  if (!client) return

  // 并行预加载，最多 10 个
  const batch = icons.slice(0, 10)
  await Promise.all(
    batch.map(async (name) => {
      const cacheKey = `${name}:${collection}`
      if (!iconCache.value[cacheKey]) {
        await fetchIconFromMCP(name, { collection })
      }
    })
  )
}

/**
 * 检查 MCP 是否可用
 */
export async function checkMCPHealth() {
  try {
    const client = await initMCP()
    if (!client) return false

    const result = await client.callTool('health_check', {})
    return !!result
  } catch {
    return false
  }
}

/**
 * 搜索图标
 */
export async function searchIcons(query, collection = 'lucide') {
  const client = await initMCP()
  if (!client) return []

  try {
    const result = await client.callTool('search_icons', { query, collection })
    return result || []
  } catch {
    return []
  }
}

export { iconCache }