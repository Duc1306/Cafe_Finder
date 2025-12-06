import { Card } from 'antd';
import { SearchOutlined, HeartOutlined, CompassOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
    const navigate = useNavigate();

    const actions = [
        {
            title: 'カフェを探す',
            description: 'お気に入りのカフェを見つけよう',
            icon: <SearchOutlined className="text-3xl text-red-600" />,
            path: '/user/cafes/search',
            color: 'from-red-50 to-red-100',
        },
        {
            title: 'お気に入り',
            description: '保存したカフェを見る',
            icon: <HeartOutlined className="text-3xl text-red-600" />,
            path: '/user/favorites',
            color: 'from-red-50 to-red-100',
        },
        {
            title: '近くのカフェ',
            description: '現在地から探す',
            icon: <CompassOutlined className="text-3xl text-green-600" />,
            path: '/user/nearby',
            color: 'from-green-50 to-green-100',
        },
        {
            title: 'レビュー',
            description: 'あなたのレビューを見る',
            icon: <StarOutlined className="text-3xl text-yellow-600" />,
            path: '/user/review',
            color: 'from-yellow-50 to-yellow-100',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {actions.map((action, idx) => (
                <Card
                    key={idx}
                    hoverable
                    onClick={() => navigate(action.path)}
                    className={`rounded-xl cursor-pointer bg-gradient-to-br ${action.color}`}
                    bodyStyle={{ padding: '1.5rem' }}
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-3">{action.icon}</div>
                        <div className="font-bold text-lg mb-1">{action.title}</div>
                        <div className="text-sm text-gray-600">{action.description}</div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
