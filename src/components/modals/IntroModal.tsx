
import React from 'react';
import { ZZZButton } from '../ui/ZZZButton';
import { modalContentStyle, modalOverlayStyle } from './FormulaModal';
import { useLanguage } from '../../locales';

interface IntroModalProps {
  onClose: () => void;
}

const DEMO_JSON = `[
  {
    "id": "demo-disc-1",
    "slot": 4,
    "set": "沧浪行歌",
    "mainStat": "critDmg",
    "subStats": [
      { "stat": "critDmg", "value": 9.6 },
      { "stat": "atk_", "value": 9.0 },
      { "stat": "atk", "value": 19 },
      { "stat": "critRate", "value": 4.8 }
    ]
  },
  {
    "id": "demo-disc-2",
    "slot": 5,
    "set": "沧浪行歌",
    "mainStat": "elemental",
    "subStats": [
      { "stat": "critRate", "value": 4.8 },
      { "stat": "atk", "value": 19 },
      { "stat": "atk_", "value": 9.0 },
      { "stat": "critDmg", "value": 9.6 }
    ]
  }
]`;

export const IntroModal: React.FC<IntroModalProps> = ({ onClose }) => {
  const { t } = useLanguage();

  const handleDownloadTemplate = () => {
    const blob = new Blob([DEMO_JSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zzz_template.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalContentStyle, width: '600px' }}>
        <h2 style={{ 
           color: 'var(--zzz-yellow)', textTransform: 'uppercase', fontStyle: 'italic',
           borderBottom: '2px solid var(--zzz-white)', paddingBottom: '12px', marginBottom: '24px'
        }}>
           系统已初始化 // 欢迎使用
        </h2>
        
        <div style={{ color: 'var(--zzz-white)', marginBottom: '32px', lineHeight: '1.6' }}>
           <p>欢迎使用 ZZZ 伤害计算器。本工具允许您使用三种不同的模式来模拟和优化代理人配装：</p>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '24px', marginBottom: '24px' }}>
              <div style={modeBoxStyle}>
                 <strong style={{ color: 'var(--zzz-cyan)' }}>1. 库存模式</strong>
                 <div style={{ fontSize: '0.9rem', color: '#ccc' }}>录入或导入您现有的驱动盘，从库存中寻找最佳的搭配方案。若需要计算指定buff下的理论结果，请输入完毕角色、音擎数据后，对显示出来的数据往上加buff即可</div>
              </div>
              
              <div style={modeBoxStyle}>
                 <strong style={{ color: 'var(--zzz-yellow)' }}>2. 理论模式</strong>
                 <div style={{ fontSize: '0.9rem', color: '#ccc' }}>基于副词条预算（例如 45 个词条）计算配装的理论上限。适合规划使用。最鸡肋的一个功能（maybe）</div>
              </div>

              <div style={modeBoxStyle}>
                 <strong style={{ color: 'var(--zzz-red)' }}>3. 直伤模式</strong>
                 <div style={{ fontSize: '0.9rem', color: '#ccc' }}>使用最终面板数据（Buff 后）进行直接计算。无需设置装备即可快速检查伤害。建议进游戏内直接加完buff暂停查看面板。</div>
              </div>
           </div>

           <p style={{ color: 'var(--zzz-yellow)', fontStyle: 'italic', fontSize: '0.9rem' }}>
              * {t('intro_clickable_note')}
           </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', borderTop: '1px solid var(--zzz-grey)', paddingTop: '24px' }}>
           <ZZZButton variant="secondary" onClick={handleDownloadTemplate}>
              下载模板 JSON
           </ZZZButton>
           <ZZZButton onClick={onClose}>
              开始模拟
           </ZZZButton>
        </div>
      </div>
    </div>
  );
};

const modeBoxStyle: React.CSSProperties = {
   background: 'var(--zzz-black)',
   border: '1px solid var(--zzz-grey)',
   padding: '12px',
   borderLeft: '4px solid var(--zzz-grey)'
};
