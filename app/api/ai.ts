// app/api/ai.ts v2.0.0
import {API_CONFIG, type ApiResponse} from './config'

export interface AISection {
    title: string
    content: string
    platforms?: string[]
}

export interface AISummaryData {
    category: string
    generatedAt: string
    summary: string
    hotTopics: Array<{
        topic: string
        description: string
        relatedPlatforms: string[]
        heat?: number // 热度百分比
    }>
    trends: Array<{
        title: string
        description: string
    }>
    sections?: AISection[]
}

/**
 * 生成模拟AI摘要数据
 */
export function generateMockAISummary(category: string): AISummaryData {
    const categoryData: Record<string, {
        summary: string
        topics: string[]
        platforms: string[]
        trends: {title: string, description: string}[]
        sections: {title: string, content: string, platforms?: string[]}[]
    }> = {
        'all': {
            summary: '当前新闻热点主要集中在科技创新、经济复苏和国际时事方面。AI技术继续快速发展，新型应用场景不断涌现。全球经济呈现缓慢复苏态势，各国采取不同政策应对通胀压力。国际局势复杂多变，区域冲突和合作并存。',
            topics: ['人工智能', '经济复苏', '国际局势', '气候变化', '数字经济'],
            platforms: ['科技日报', '财经网', '环球时报', '央视新闻', '新浪科技'],
            trends: [
                { title: 'AI技术全面应用', description: '人工智能技术正从实验室走向各行各业，带来生产效率的显著提升。' },
                { title: '绿色发展成为主流', description: '可持续发展理念深入人心，各国加大对清洁能源的投入。' },
                { title: '数字化转型加速', description: '疫情后数字化进程明显加快，线上经济模式持续创新。' }
            ],
            sections: [
                { 
                    title: '科技创新前沿', 
                    content: '新一代AI大模型不断涌现，性能持续突破，应用场景日益丰富。量子计算研究取得重要进展，有望在未来几年实现实用化。',
                    platforms: ['科技日报', '新浪科技', '36氪']
                },
                { 
                    title: '全球经济观察', 
                    content: '主要经济体货币政策趋于正常化，通胀压力有所缓解。新兴市场国家增长表现强劲，成为全球经济增长的重要引擎。',
                    platforms: ['财经网', '经济观察报']
                }
            ]
        },
        'tech': {
            summary: '科技领域创新活跃，AI大模型、芯片技术、元宇宙等领域持续突破。各大科技巨头纷纷加大研发投入，新一轮技术竞争已经开始。开源社区蓬勃发展，加速技术创新和应用普及。',
            topics: ['AI大模型', '芯片技术', '元宇宙', '开源软件', '量子计算'],
            platforms: ['科技日报', '新浪科技', '36氪', '爱范儿', 'InfoQ'],
            trends: [
                { title: '多模态AI兴起', description: '结合文本、图像、音频等多种模态的AI模型成为发展热点，应用场景大幅扩展。' },
                { title: 'AI治理日益重视', description: '随着AI应用普及，伦理、安全和监管问题受到广泛关注。' },
                { title: '边缘计算加速落地', description: '边缘计算技术与5G结合，推动实时应用场景发展。' }
            ],
            sections: [
                { 
                    title: 'AI大模型进展', 
                    content: '新一代大语言模型参数规模持续扩大，推理能力和多任务处理能力显著提升。专用AI模型在垂直领域表现出色，商业化进程加快。',
                    platforms: ['科技日报', '新浪科技', '36氪']
                },
                { 
                    title: '芯片产业动态', 
                    content: '芯片设计和制造技术持续突破，国产芯片产业发展势头良好。新型计算架构不断涌现，满足AI等新兴应用需求。',
                    platforms: ['半导体行业观察', '电子工程专辑']
                }
            ]
        },
        'finance': {
            summary: '全球金融市场波动加剧，货币政策转向成为关注焦点。数字金融创新持续推进，央行数字货币试点范围扩大。绿色金融发展迅速，ESG投资理念深入人心。',
            topics: ['货币政策', '数字金融', '绿色金融', '资本市场', '房地产市场'],
            platforms: ['财经网', '经济观察报', '金融时报', '第一财经', '证券日报'],
            trends: [
                { title: '数字人民币推广加速', description: '数字人民币试点范围持续扩大，应用场景不断丰富。' },
                { title: 'ESG投资升温', description: '环境、社会和公司治理因素成为投资决策的重要考量。' },
                { title: '金融监管趋严', description: '全球金融监管框架不断完善，防范系统性风险成为首要任务。' }
            ],
            sections: [
                { 
                    title: '货币政策走向', 
                    content: '主要经济体央行政策立场分化，部分国家开始降息周期，而通胀压力较大的国家仍保持相对紧缩。',
                    platforms: ['财经网', '金融时报']
                },
                { 
                    title: '资本市场动态', 
                    content: '全球股市波动加剧，科技创新板块表现活跃。债券市场收益率曲线倒挂现象有所缓解，投资者风险偏好提升。',
                    platforms: ['证券日报', '投资时报']
                }
            ]
        },
        'sports': {
            summary: '全球体育赛事精彩纷呈，多项顶级赛事备受关注。电竞产业持续高速发展，传统体育与数字体育融合加速。体育产业数字化转型深入推进，新技术应用提升观赛体验。',
            topics: ['国际赛事', '电竞产业', '体育科技', '运动员表现', '体育产业'],
            platforms: ['体坛周报', '腾讯体育', '新浪体育', '虎扑体育', 'PP体育'],
            trends: [
                { title: '电竞入奥进程加速', description: '电竞项目正逐步获得国际奥委会认可，有望在未来奥运会中亮相。' },
                { title: '体育数字化转型', description: '5G、VR/AR等技术在体育赛事直播和训练中广泛应用。' },
                { title: '女性体育崛起', description: '女子体育赛事关注度和商业价值显著提升，性别平等理念深入人心。' }
            ],
            sections: [
                { 
                    title: '国际赛事聚焦', 
                    content: '各项国际赛事进入关键阶段，多支国家队备战工作有序推进。明星运动员状态出色，创造多项优异成绩。',
                    platforms: ['体坛周报', '腾讯体育']
                },
                { 
                    title: '电竞产业观察', 
                    content: '电竞市场规模持续扩大，职业联赛体系日益完善。资本持续涌入，产业链各环节发展均衡。',
                    platforms: ['新浪电竞', '17173']
                }
            ]
        },
        'entertainment': {
            summary: '影视产业迎来复苏，多部大片票房表现亮眼。音乐产业数字化转型深入，流媒体平台竞争激烈。综艺节目创新不断，内容质量持续提升。文化出海取得新突破，国产内容国际影响力增强。',
            topics: ['影视产业', '音乐市场', '综艺节目', '明星动态', '文化出海'],
            platforms: ['爱奇艺', '腾讯视频', '网易娱乐', '新浪娱乐', '豆瓣电影'],
            trends: [
                { title: '元宇宙娱乐兴起', description: '虚拟演唱会、数字人等新兴娱乐形式受到年轻用户欢迎。' },
                { title: '短剧市场爆发', description: '短视频平台推出的短剧内容走红，成为新的内容消费形式。' },
                { title: '国潮文化兴起', description: '传统文化元素与现代娱乐形式结合，引发广泛关注。' }
            ],
            sections: [
                { 
                    title: '影视市场观察', 
                    content: '国产电影质量显著提升，多部作品口碑票房双丰收。流媒体平台自制内容投入加大，精品化策略成效明显。',
                    platforms: ['爱奇艺', '腾讯视频']
                },
                { 
                    title: '音乐产业动态', 
                    content: '数字音乐市场规模持续扩大，音乐人收入结构多元化。直播演唱会成为新常态，线上线下融合发展。',
                    platforms: ['网易云音乐', 'QQ音乐']
                }
            ]
        },
        'car': {
            summary: '新能源汽车市场竞争加剧，技术创新和成本控制成为关键。智能驾驶技术快速发展，L3级自动驾驶开始商业化落地。汽车产业数字化、智能化转型深入推进，用户体验持续优化。',
            topics: ['新能源汽车', '智能驾驶', '汽车芯片', '充电设施', '汽车设计'],
            platforms: ['汽车之家', '懂车帝', '易车网', '爱卡汽车', '太平洋汽车网'],
            trends: [
                { title: '固态电池商业化加速', description: '固态电池技术取得重大突破，有望解决新能源汽车续航焦虑问题。' },
                { title: '车路协同发展', description: '智能网联汽车与智能交通系统协同发展，推动自动驾驶进程。' },
                { title: '汽车软件定义趋势', description: '软件在汽车价值链中的地位日益提升，OTA升级成为标配。' }
            ],
            sections: [
                { 
                    title: '新能源汽车市场', 
                    content: '市场竞争白热化，价格战持续上演。新势力和传统车企加速电动化转型，产品矩阵不断丰富。',
                    platforms: ['汽车之家', '懂车帝']
                },
                { 
                    title: '智能驾驶进展', 
                    content: '高级辅助驾驶功能普及率提升，城市NOA功能开始落地。芯片算力持续提升，算法性能显著改善。',
                    platforms: ['盖世汽车', '电动邦']
                }
            ]
        },
        'social': {
            summary: '社交媒体平台格局相对稳定，但竞争依然激烈。短视频持续主导内容消费，直播电商蓬勃发展。社交平台承担更多社会责任，内容监管日益严格。元宇宙社交概念兴起，虚拟社交空间成为新战场。',
            topics: ['短视频平台', '直播电商', '社交监管', '隐私保护', '元宇宙社交'],
            platforms: ['微博', '微信', '抖音', '快手', '小红书'],
            trends: [
                { title: '社交电商融合加深', description: '社交与电商边界日益模糊，内容种草转化效率提升。' },
                { title: '去中心化社交兴起', description: '基于区块链技术的去中心化社交平台获得关注。' },
                { title: '隐私保护成为焦点', description: '用户对隐私保护需求增强，平台调整数据政策应对监管。' }
            ],
            sections: [
                { 
                    title: '短视频生态', 
                    content: '短视频平台用户粘性持续提升，内容创作生态日趋完善。商业化模式成熟，广告、电商等多元变现渠道发展。',
                    platforms: ['抖音', '快手']
                },
                { 
                    title: '社交监管趋势', 
                    content: '内容审核机制不断完善，平台责任明确化。虚假信息治理取得进展，网络空间清朗化持续推进。',
                    platforms: ['微博', '微信']
                }
            ]
        },
        'hot': {
            summary: '当前热点话题涉及社会民生、科技发展、娱乐体育等多个领域。社交媒体成为热点传播的主要渠道，话题发酵速度加快。公众参与度高，讨论氛围活跃。热点话题生命周期缩短，更新迭代速度加快。',
            topics: ['民生热点', '突发事件', '明星八卦', '社会现象', '公共政策'],
            platforms: ['微博热搜', '知乎热榜', '百度热搜', '抖音热点', '头条热榜'],
            trends: [
                { title: '热点传播去中心化', description: '从单一平台主导到多平台共同发酵的传播格局。' },
                { title: '理性讨论氛围形成', description: '公众对热点事件的分析更加理性，专业声音获得更多关注。' },
                { title: '热点与商业结合紧密', description: '品牌借势热点营销成为常态，内容营销价值凸显。' }
            ],
            sections: [
                { 
                    title: '民生关注焦点', 
                    content: '教育、医疗、住房等民生话题持续受到关注，相关政策调整引发广泛讨论。公共服务质量提升成为社会共识。',
                    platforms: ['微博', '知乎']
                },
                { 
                    title: '突发事件追踪', 
                    content: '各类突发事件信息传播迅速，媒体报道更加及时透明。应急响应机制不断完善，公众应对能力提升。',
                    platforms: ['央视新闻', '人民日报']
                }
            ]
        }
    }

    const data = categoryData[category] || categoryData['all']
    const now = new Date().toISOString()
    
    return {
        category,
        generatedAt: now,
        summary: data.summary,
        hotTopics: data.topics.map((topic, index) => ({
            topic,
            description: `${topic}成为当前热门话题，相关讨论持续升温，引发广泛关注。`,
            relatedPlatforms: data.platforms.slice(0, Math.min(3, data.platforms.length)),
            heat: Math.floor(Math.random() * 30) + 70 // 70-99的随机热度值
        })),
        trends: data.trends,
        sections: data.sections
    }
}

/**
 * 获取AI总结内容
 */
export async function fetchAISummary(category: string): Promise<AISummaryData> {
    // 优先尝试API调用
    if (import.meta.env.PROD && API_CONFIG.baseURL) {
        const url = `${API_CONFIG.baseURL}/news/ai?category=${encodeURIComponent(category)}`

        // 创建AbortController来实现超时控制
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // AI总结可能需要更长时间

        try {
            const response = await fetch(url, {
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result: ApiResponse<AISummaryData> = await response.json()

            if (result.code === 200) {
                return result.data
            } else {
                throw new Error(result.msg || '获取AI总结失败')
            }
        } catch (error) {
            clearTimeout(timeoutId)
            // 如果API调用失败，返回模拟数据
            console.warn('AI摘要API调用失败，使用模拟数据:', error)
        }
    }
    
    // 返回模拟数据
    return generateMockAISummary(category)
}
