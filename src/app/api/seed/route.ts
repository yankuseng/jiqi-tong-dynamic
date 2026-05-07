import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Seed data for initial companies
const SEED_COMPANIES = [
  { name: '山东恒宇电子有限公司', address: '济南', business: '软件制作', posts_count: 8 },
  { name: '中安云科', address: '济南', business: '软件开发', posts_count: 6 },
  { name: '山东省城市商业银行合作联盟有限公司', address: '济南', business: '金融服务', posts_count: 2 },
  { name: '山东华瑞源网络科技有限公司', address: '济南市历城区', business: '二手车交易', posts_count: 2 },
  { name: '济南穿越者网络科技有限公司', address: '济南市槐荫区', business: '软件制作、网站开发', posts_count: 2 },
  { name: '普联软件股份有限公司', address: '齐鲁软件园B座', business: '软件开发', posts_count: 4 },
  { name: '慧族网络科技发展有限公司', address: '历下区海尔时代大厦', business: '软件制作、外包开发', posts_count: 3 },
  { name: '山东鸿业信息科技有限公司', address: '齐鲁文化创意园', business: '软件开发', posts_count: 2 },
  { name: '济南中安数码科技有限公司', address: '高新区银荷大厦', business: '地质方面软件开发', posts_count: 2 },
  { name: '北京知金大鹏教育', address: '历山路天鹅大厦', business: '教育培训', posts_count: 2 },
  { name: '山东众阳健康', address: '奥盛大厦', business: '医疗', posts_count: 1 },
  { name: '中孚信息', address: '济南', business: '信创项目', posts_count: 2 },
  { name: '山东沪康信息技术有限公司', address: '济南', business: '软件开发', posts_count: 2 },
  { name: '山东亿云信息有限公司', address: '银荷大厦', business: '软件制作', posts_count: 1 },
  { name: '山东互联网医保大健康', address: '济南', business: '医院项目', posts_count: 1 },
]

// Sample reviews for demonstration
const SAMPLE_REVIEWS: Record<string, { content: string; overtime?: string; salary?: string }[]> = {
  '山东恒宇电子有限公司': [
    { content: '加班加的要猝死，wp指着鼻子骂娘，跟总贱穿一条裤子，那个什么贱的动不动就扣钱，光出骚点子，动不动就扣钱', overtime: '经常加班到晚上10点', salary: '8K × 13薪' }
  ],
  '中安云科': [
    { content: '加班加到死，996加班，把你当超人使用', overtime: '996', salary: '10K' }
  ],
  '普联软件股份有限公司': [
    { content: '每周周六无偿加班，平时也都无偿加班到7点左右无加班费，平台比较老，出差报销很慢，拖2周左右，招聘大量的实习生，项目没有效率，加班严重。', overtime: '周六加班，平时到7点', salary: '7K-12K' }
  ],
  '山东众阳健康': [
    { content: '带了一个半月受不了走了，走的时候10月份的工资直接不给你了，然后每月开的民主生活会的主题一般是"批评与自我批评"，洗脑大会。', overtime: '经常加班', salary: '面议' }
  ]
}

export async function POST() {
  try {
    const supabase = createServerClient()
    
    let insertedCompanies = 0
    let insertedReviews = 0
    
    for (const company of SEED_COMPANIES) {
      // Insert company
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('name', company.name)
        .single()
      
      let companyId: number
      
      if (existingCompany) {
        companyId = existingCompany.id
      } else {
        const { data: newCompany, error: insertError } = await supabase
          .from('companies')
          .insert({
            name: company.name,
            address: company.address,
            business: company.business,
            posts_count: company.posts_count,
          })
          .select('id')
          .single()
        
        if (insertError || !newCompany) {
          console.error(`Failed to insert company ${company.name}:`, insertError)
          continue
        }
        companyId = newCompany.id
        insertedCompanies++
      }
      
      // Insert sample reviews if any
      const reviews = SAMPLE_REVIEWS[company.name]
      if (reviews) {
        for (const review of reviews) {
          const { error: reviewError } = await supabase
            .from('reviews')
            .insert({
              company_id: companyId,
              content: review.content,
              overtime: review.overtime || null,
              salary: review.salary || null,
            })
          
          if (!reviewError) {
            insertedReviews++
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `数据初始化完成！新增 ${insertedCompanies} 家公司，${insertedReviews} 条点评。`,
      companies: insertedCompanies,
      reviews: insertedReviews
    })
    
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: '数据初始化失败', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: '数据初始化API - 请使用POST方法',
    endpoint: '/api/seed',
    method: 'POST'
  })
}
