exports.getOverview = async (req, res) => {
  try {
    // Generate mock mock data tailored for this specific API request
    const payload = {
      kpis: {
        followers: { total: 842000, change: 12.4 },
        impressions: { total: 2400000, change: 8.1 },
        engagementRate: { total: 4.82, change: -1.2 },
        postFrequency: { total: 14, change: 5.0 }
      },
      chartData: {
        Engagement: [
          { date: 'Week 1', value: 400 },
          { date: 'Week 2', value: 300 },
          { date: 'Week 3', value: 500 },
          { date: 'Week 4', value: 450 },
        ],
        Reach: [
          { date: 'Week 1', value: 12000 },
          { date: 'Week 2', value: 15000 },
          { date: 'Week 3', value: 13500 },
          { date: 'Week 4', value: 18000 },
        ],
        Conversions: [
          { date: 'Week 1', value: 45 },
          { date: 'Week 2', value: 60 },
          { date: 'Week 3', value: 55 },
          { date: 'Week 4', value: 80 },
        ]
      },
      networkDistribution: [
        { platform: 'Instagram', percentage: 55, color: 'bg-primary' },
        { platform: 'TikTok', percentage: 30, color: 'bg-secondary' },
        { platform: 'LinkedIn', percentage: 15, color: 'bg-tertiary' }
      ],
      audienceDna: {
        topAgeGroup: '25-34',
        regions: [
          { name: 'United States', percentage: 42 },
          { name: 'United Kingdom', percentage: 18 },
          { name: 'Germany', percentage: 12 },
          { name: 'Brazil', percentage: 10 }
        ]
      }
    };
    
    res.json(payload);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
