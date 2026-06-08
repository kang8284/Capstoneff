import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const styleLabels = {
    casual: '캐주얼',
    street: '스트릿',
    formal: '포멀',
    lovely: '러블리',
};

const bodyTypeLabels = {
    natural: '내추럴',
    wave: '웨이브',
    straight: '스트레이트',
};

const outfitImages = {
    male: {
        natural: {
            casual: '/images/male-natural-casual.png',
            street: '/images/male-natural-street.png',
            formal: '/images/male-natural-formal.png',
        },
        wave: {
            casual: '/images/male-wave-casual.png',
            street: '/images/male-wave-street.png',
            formal: '/images/male-wave-formal.png',
        },
        straight: {
            casual: '/images/male-straight-casual.png',
            street: '/images/male-straight-street.png',
            formal: '/images/male-straight-formal.png',
        },
    },
    female: {
        natural: {
            casual: '/images/female-natural-casual.png',
            street: '/images/female-natural-street.png',
            formal: '/images/female-natural-formal.png',
            lovely: '/images/female-natural-lovely.png',
        },
        wave: {
            casual: '/images/female-wave-casual.png',
            street: '/images/female-wave-street.png',
            formal: '/images/female-wave-formal.png',
            lovely: '/images/female-wave-lovely.png',
        },
        straight: {
            casual: '/images/female-straight-casual.png',
            street: '/images/female-straight-street.png',
            formal: '/images/female-straight-formal.png',
            lovely: '/images/female-straight-lovely.png',
        },
    },
};

const bodyComments = {
    male: {
        natural: {
            shoulder:
                '어깨선과 골격이 비교적 균형 있게 형성되어 있어 다양한 스타일을 자연스럽게 소화할 수 있는 체형입니다. 전체적인 비율이 안정적이라는 장점이 있지만, 반대로 특정 부위가 강하게 돋보이지 않아 평범해 보일 수 있습니다. 상체 실루엣을 적절히 살려주는 아이템을 활용하면 더욱 세련된 인상을 만들 수 있습니다.',
            lower: '하체 비율 역시 균형감이 좋은 편으로 다양한 팬츠 스타일을 소화하기 유리합니다. 다만 지나치게 루즈한 실루엣을 선택할 경우 체형의 장점이 묻힐 수 있습니다. 자연스러운 비율을 유지하면서도 실루엣을 살리는 스타일링이 효과적입니다.',
            styling:
                '균형 잡힌 체형이라는 강점을 활용하되, 전체적으로 밋밋해 보이지 않도록 포인트를 주는 스타일링을 추천합니다. 상의 또는 하의 한쪽에 볼륨감을 주어 시선을 분산시키면 더욱 완성도 높은 코디를 연출할 수 있습니다.',
        },
        straight: {
            shoulder:
                '어깨와 가슴 라인이 발달해 상체 존재감이 뚜렷한 체형입니다. 남성적이고 탄탄한 인상을 줄 수 있다는 장점이 있지만, 상체가 과하게 강조되면 다소 무거워 보일 수 있습니다. 깔끔한 핏과 구조감 있는 상의가 체형의 장점을 효과적으로 살려줍니다.',
            lower: '상체에 비해 하체가 상대적으로 슬림하게 보이는 경우가 많습니다. 따라서 너무 슬림한 팬츠는 상·하체 비율 차이를 더욱 강조할 수 있습니다. 적당한 여유가 있는 팬츠를 활용하면 전체적인 균형감을 높일 수 있습니다.',
            styling:
                '상체의 강점을 살리면서 하체의 볼륨을 보완하는 방향을 추천합니다. 상체는 깔끔하게 정리하고 하체는 적당한 존재감을 더하면 안정적이고 세련된 비율을 연출할 수 있습니다.',
        },
        wave: {
            shoulder:
                '어깨선이 부드럽고 상체가 비교적 슬림하게 보이는 체형입니다. 가볍고 세련된 인상을 줄 수 있지만, 상체가 왜소해 보일 수 있다는 점은 보완이 필요합니다. 레이어드 스타일이나 적당한 볼륨감이 있는 상의를 활용하면 더욱 균형 잡힌 실루엣을 만들 수 있습니다.',
            lower: '다리 라인이 길어 보이고 하체 비율이 돋보이는 경우가 많습니다. 이는 세련된 비율감을 만들어주는 장점이지만, 상체와 하체의 존재감 차이가 커질 수 있습니다. 전체적인 밸런스를 고려한 스타일링이 중요합니다.',
            styling:
                '상체에 시선을 모을 수 있는 디테일을 추가하고 하체는 깔끔하게 정리하는 방향을 추천합니다. 상체 볼륨을 적절히 보완하면 체형의 장점을 더욱 효과적으로 살릴 수 있습니다.',
        },
    },

    female: {
        natural: {
            shoulder:
                '어깨선과 골격이 자연스럽게 균형을 이루고 있어 다양한 스타일을 무난하게 소화할 수 있는 체형입니다. 특정 부위가 과하게 강조되지 않아 편안하고 세련된 인상을 주는 것이 장점입니다. 다만 실루엣이 지나치게 루즈해질 경우 체형의 장점이 묻혀 다소 부해 보일 수 있습니다. 자연스럽게 떨어지는 핏을 활용하면서도 비율을 살려주는 스타일링이 효과적입니다.',
            lower: '상·하체 비율이 비교적 균형 있게 형성되어 있으며 전체적인 실루엣이 안정적으로 보입니다. 다양한 하의 스타일을 소화할 수 있다는 장점이 있지만, 너무 박시한 아이템을 선택하면 체형의 매력이 감소할 수 있습니다. 적절한 실루엣을 유지하는 것이 중요합니다.',
            styling:
                '균형 잡힌 체형이라는 강점을 활용해 자연스러운 실루엣을 중심으로 스타일링해 보세요. 상의 또는 하의 한쪽에 포인트를 주어 밋밋함을 줄이면 더욱 세련된 분위기를 연출할 수 있습니다. 선택한 스타일의 특징을 살리면서도 전체적인 비율감을 유지하는 것이 핵심입니다.',
        },
        straight: {
            shoulder:
                '어깨와 상체에 적당한 볼륨감이 형성되어 있어 세련되고 고급스러운 인상을 주는 체형입니다. 상체의 존재감이 뚜렷해 심플한 디자인도 깔끔하게 소화할 수 있는 장점이 있습니다. 반면 상체에 장식이나 볼륨이 과도하게 더해질 경우 다소 답답하거나 무거운 인상을 줄 수 있습니다. 깔끔한 라인의 아이템이 체형과 좋은 조화를 이룹니다.',
            lower: '상체가 상대적으로 강조되는 체형으로 하체와의 균형을 고려한 스타일링이 중요합니다. 지나치게 슬림한 하의는 상체의 존재감을 더욱 부각시킬 수 있으므로 적당한 볼륨감을 가진 하의를 활용하는 것이 좋습니다. 전체적인 비율을 정리해 주는 실루엣이 잘 어울립니다.',
            styling:
                '상체의 장점을 살리면서 하체에 자연스러운 균형을 더하는 방향을 추천합니다. 군더더기 없는 디자인과 적당한 핏을 활용하면 세련되고 도시적인 분위기를 연출할 수 있습니다. 과도한 장식보다는 깔끔한 실루엣에 집중하는 것이 좋습니다.',
        },
        wave: {
            shoulder:
                '어깨선이 부드럽고 상체가 비교적 슬림하게 보이는 체형입니다. 여성스럽고 우아한 분위기를 자연스럽게 표현할 수 있다는 장점이 있습니다. 다만 상체가 다소 빈약해 보일 수 있어 적절한 볼륨감이나 디테일을 활용한 스타일링이 도움이 됩니다. 부드러운 소재와 섬세한 디테일이 체형의 매력을 더욱 살려줍니다.',
            lower: '허리선과 하체 라인이 자연스럽게 강조되는 경우가 많아 곡선미가 돋보이는 체형입니다. 체형의 장점이 잘 드러나는 반면, 상체와 하체의 존재감 차이가 커 보일 수 있다는 점은 고려할 필요가 있습니다. 상체에 적절한 포인트를 주면 더욱 균형 잡힌 인상을 만들 수 있습니다.',
            styling:
                '상체에는 적당한 볼륨과 포인트를 더하고 하체는 깔끔하게 정리하는 스타일을 추천합니다. 허리선을 자연스럽게 살리는 아이템을 활용하면 체형의 장점이 더욱 돋보입니다. 부드럽고 여성스러운 실루엣을 유지하면서 전체적인 균형을 맞추는 것이 핵심입니다.',
        },
    },
};

const styleDescriptions = {
    male: {
        natural: {
            casual: '추천 이유: 어깨가 발달하고 전체적으로 골격이 탄탄한 내추럴 체형의 장점을 살려, 어깨를 넓어 보이게 하고 허리는 슬림하게 연출하는 역삼각형 실루엣을 완성했습니다.\n\n체형 보완/강조 포인트: 어깨선을 드롭 숄더 형태로 자연스럽게 떨어뜨려 어깨를 강조하고, 넓게 퍼지는 핏의 팬츠로 골격의 볼륨감을 살려 건강하고 남성적인 이미지를 연출했습니다.',
            formal: '추천 이유: 남성 내추럴 체형은 골격이 탄탄하고 어깨가 넓은 편이므로, 자연스럽게 떨어지는 드롭 숄더 실루엣의 브라운 자켓과 여유 있는 핏의 테이퍼드 슬랙스를 매치하여 편안하면서도 남성적인 포멀룩을 완성했습니다.\n\n체형 보완/강조 포인트: 어깨선을 살려주는 자켓으로 역삼각형 체형을 강조하고, 발목이 드러나지 않는 길이의 팬츠로 안정감 있는 코디를 연출하여 비율이 좋아 보이게 했습니다.',
            street: '추천 이유: 탄탄하고 골격이 발달한 네추럴 체형의 장점을 살려, 드롭 숄더 실루엣의 오버핏 후드티와 와이드 카고 팬츠를 매치하여 편안하면서도 스타일리시한 스트릿 룩을 완성했습니다.\n\n체형 보완/강조 포인트: 루즈한 핏의 후드티로 상체를 강조하고, 와이드 카고 팬츠의 주머니 디테일과 여유 있는 실루엣이 탄탄한 골격을 자연스럽게 커버하며 안정감을 줍니다.',
        },
        straight: {
            casual: '추천 이유: 전체적으로 입체감과 두께감이 있는 스트레이트 체형의 특징에 맞춰, 군더더기 없이 깔끔하게 떨어지는 세로 골지 니트와 일자 핏의 흑청 데님을 매치해 단정하고 세련된 캐주얼룩을 완성했습니다.\n\n체형 보완/강조 포인트: 상의의 정핏 실루엣과 세로 스트라이프 패턴이 부해 보임을 방지하고, 하이웨이스트가 아닌 적당한 밑위의 팬츠가 상·하체 비율을 균형감 있게 잡아줍니다.',
            formal: '추천 이유: 탄탄한 상체 볼륨감을 가진 스트레이트 체형에 맞추어, 군더더기 없이 깔끔하게 떨어지는 정핏의 차콜 수트 셋업과 블랙 이너를 매치해 군살 없이 슬림하고 세련된 포멀룩을 완성했습니다.\n\n체형 보완/강조 포인트: 적당한 두께감과 직선적인 실루엣의 자켓이 가슴 주변의 부해 보임을 눌러주고, 일자로 곧게 뻗은 슬랙스가 다리를 길고 깔끔하게 연출해 줍니다.',
            street: '추천 이유: 탄탄한 체형을 가진 스트레이트 타입에 맞춰 너무 늘어지지 않고 탄탄한 핏의 그레이 후드티와 군더더기 없이 일자로 떨어지는 블랙 와이드 팬츠를 매치하여 깔끔하고 힙한 스트릿 룩을 완성했습니다.\n\n체형 보완/강조 포인트: 과하지 않은 정핏 위주의 상의가 가슴 주변의 부해 보임을 잡아주고, 툭 떨어지는 실루엣의 팬츠가 스트레이트 체형 특유의 곧은 다리 라인을 한층 더 슬림하고 길어 보이게 연출합니다.',
        },
        wave: {
            casual: '추천 이유: 상체 골격이 부드럽고 다소 가늘어 보일 수 있는 웨이브 체형의 특징에 맞춰, 볼륨감 있는 둥근 실루엣의 브라운 가디건과 빈티지한 워싱의 테이퍼드 데님을 매치해 캐주얼하면서도 부드러운 이미지를 완성했습니다.\n\n체형 보완/강조 포인트: 상의의 라운드넥 디테일과 유연한 소재감이 빈약해 보일 수 있는 상체에 자연스러운 볼륨감을 더해주고, 밑위가 적당히 긴 팬츠가 낮아 보일 수 있는 골반 위치를 보완해 다리를 더 길어 보이게 합니다.',
            formal: '추천 이유: 상체 골격이 얇고 아래로 처지기 쉬운 웨이브 체형의 특징을 고려해, 카라 디테일로 목과 어깨 주변에 입체감을 주는 블랙 카라 니트티와 깔끔한 차콜 슬랙스를 매치하여 미니멀하면서도 격식 있는 포멀룩을 완성했습니다.\n\n체형 보완/강조 포인트: 시선을 위로 끌어올려 주는 버튼 디테일의 상의로 빈약해 보일 수 있는 상체를 보완하고, 턱이 잡힌 하이웨이스트 실루엣의 슬랙스가 낮아 보일 수 있는 허리선과 골반 위치를 높여주어 다리를 한층 길어 보이게 만듭니다.',
            street: '추천 이유: 상체 골격이 부드럽고 가늘어 오버핏이 겉돌기 쉬운 웨이브 체형의 특징을 고려해, 어깨선이 적당히 맞으면서도 후드 디테일로 볼륨을 주는 블랙 바람막이와 트렌디한 고프코어 무드의 트랙 팬츠를 매치해 힙한 스트릿 룩을 완성했습니다.\n\n체형 보완/강조 포인트: 상의 집업의 후드와 넥라인 디테일이 상체로 시선을 끌어올려 빈약함을 보완하고, 하이라이즈 형태로 높게 착용할 수 있는 밴딩 카고 트랙 팬츠가 웨이브 체형 특유의 낮은 허리선을 커버하여 다리 라인을 길어 보이게 합니다.',
        },
    },

    female: {
        natural: {
            casual: '추천 이유: 전체적으로 골격과 프레임이 발달한 여성 내추럴 체형에 맞춰, 유연하지만 힘 있는 데님 셔츠와 와이드 핏 데님 팬츠를 매치해 내추럴 체형 특유의 멋스럽고 스타일리시한 청청 캐주얼룩을 완성했습니다.\n\n체형 보완/강조 포인트: 어깨선을 부드럽게 감싸는 오버핏 반팔 셔츠가 어깨 골격을 돋보이게 만들고, 빈티지한 워싱이 가미된 와이드 데님 팬츠가 탄탄한 골격을 자연스럽게 커버하며 안정적인 실루엣을 연출합니다.',
            formal: '추천 이유: 탄탄한 골격을 가진 여성 내추럴 체형에 어울리는 여유 있는 핏의 화이트 셔츠와 브이넥 블랙 니트를 레이어드하고 일자로 툭 떨어지는 슬랙스를 매치해, 격식 있으면서도 내추럴 체형 특유의 멋스러움이 살아나는 포멀룩을 완성했습니다.\n\n체형 보완/강조 포인트: 어깨선이 부드럽게 떨어지는 니트의 브이넥 디테일이 시선을 중앙으로 모아 넓은 어깨 골격을 우아하게 보완하고, 여유 있는 세미 와이드 슬랙스가 전체적인 프레임과 균형을 이루며 슬림한 실루엣을 연출합니다.',
            lovely: '추천 이유: 전체적으로 프레임이 탄탄한 여성 내추럴 체형에 맞춰, 자연스러운 주름이 잡힌 화이트 뷔스티에 롱 원피스와 루즈한 핏의 그레이 브이넥 니트를 레이어드하여 편안하면서도 사랑스러운 무드를 완성했습니다.\n\n체형 보완/강조 포인트: 어깨선이 루즈하게 떨어지는 얇은 니트가 넓은 어깨 골격을 부드럽게 감싸주고, 발목까지 툭 떨어지는 맥시한 기감의 원피스가 프레임이 있는 체형 특유의 내추럴한 실루엣을 장점으로 살려줍니다.',
            street: '추천 이유: 탄탄한 프레임을 가진 여성 내추럴 체형의 장점을 극대화해 주는 그래픽 티셔츠와 블랙 후드티, 그리고 트렌디한 워싱의 와이드 데님을 매치해 캐주얼하면서도 힙한 스트릿 룩을 완성했습니다.\n\n체형 보완/강조 포인트: 드롭 숄더 실루엣의 후드티가 발달한 어깨 골격을 둔하지 않고 자연스럽게 커버하며, 하체의 볼륨감을 살려주는 와이드 핏 데님이 전체적인 신체 밸런스를 안정감 있게 잡아줍니다.',
        },

        straight: {
            casual: '추천 이유: 전체적으로 입체감 있고 탄탄한 상체 볼륨감을 가진 여성 스트레이트 체형에 맞춰, 군더더기 없는 정핏의 스포티한 반팔티와 곧게 뻗은 일자 핏의 연청 와이드 데님을 매치해 단정하면서도 힙한 캐주얼룩을 완성했습니다.\n\n체형 보완/강조 포인트: 상의의 적당한 파임이 있는 브이넥 디테일이 답답해 보일 수 있는 가슴 주변을 시원하게 보완해주고, 하이웨이스트가 아닌 적당한 밑위의 데님 팬츠가 스트레이트 체형 고유의 슬림한 다리 라인을 깔끔하게 돋보이게 합니다.',
            formal: '추천 이유: 상체에 입체적인 볼륨감이 있는 여성 스트레이트 체형에 맞춰, 브이넥 그레이 가디건과 깔끔하게 떨어지는 블랙 자켓, 화이트 슬랙스를 매치해 단정하고 이지적인 무드의 포멀룩을 완성했습니다.\n\n체형 보완/강조 포인트: 자켓과 가디건의 깊은 브이넥 실루엣이 가슴 주변의 답답함을 시원하게 덜어주고, 핀턱이 강하지 않고 곧게 뻗은 일자 핏 슬랙스가 스트레이트 체형 특유의 곧고 슬림한 다리 라인을 깔끔하게 강조합니다.',
            lovely: '추천 이유: 상체에 입체감이 있어 과한 프릴이 부담스러울 수 있는 스트레이트 체형에 맞춰, 가벼운 리본 디테일의 화이트 블라우스와 세미 부츠컷 데님을 매치해 과하지 않고 깔끔한 러블리룩을 완성했습니다.\n\n체형 보완/강조 포인트: 넥라인이 부드럽게 트인 정핏 블라우스가 목선을 시원하게 살려주고, 무릎 아래로 자연스럽게 퍼지는 부츠컷 팬츠가 스트레이트 체형의 슬림한 다리 라인을 더욱 돋보이게 합니다.',
            street: '추천 이유: 상체 중심의 볼륨감이 탄탄한 여성 스트레이트 체형에 맞춰, 군더더기 없는 정핏 화이트 로고 티셔츠에 툭 떨어지는 일자 핏 블랙 데님과 집업 후드를 매치해 힙하면서도 정돈된 스트릿 룩을 완성했습니다.\n\n체형 보완/강조 포인트: 상의 이너의 깔끔한 U넥 실루엣과 오픈하여 연출할 수 있는 집업 후드가 상체의 부해 보임을 덜어주고, 일자로 곧게 뻗은 팬츠가 스트레이트 체형 고유의 슬림한 다리 라인을 자연스럽게 강조합니다.',
        },

        wave: {
            casual: '추천 이유: 상체 골격이 부드럽고 가늘어 밋밋해 보일 수 있는 여성 웨이브 체형에 맞춰, 전면의 큼직한 레터링 로고로 시선을 위로 끌어올리는 라이트 그레이 반팔티와 은은한 워싱의 연청 데님을 매치해 경쾌하고 발랄한 캐주얼룩을 완성했습니다.\n\n체형 보완/강조 포인트: 상의의 둥근 밑단 실루엣과 그래픽 디자인이 가늘고 긴 상체에 자연스러운 입체감을 더해주고, 골반 라인을 안정감 있게 감싸주는 하이웨이스트 핏의 와이드 데님 팬츠가 웨이브 체형 특유의 낮은 허리선을 보완하여 다리를 한층 더 길어 보이게 만듭니다.',
            formal: '추천 이유: 상체 골격이 가늘고 허리선이 낮아 상하체 비율을 잡아주는 것이 중요한 여성 웨이브 체형에 맞춰, 허리 라인을 높여주는 크롭 기감의 블랙 자켓과 깔끔한 화이트 티셔츠, 블랙 슬랙스를 매치해 세련되면서도 격식 있는 포멀룩을 완성했습니다.\n\n체형 보완/강조 포인트: 숏한 기장의 크롭 자켓이 시선을 위로 끌어올려 빈약해 보일 수 있는 상체를 보완하고, 하이웨이스트 핏의 핀턱 슬랙스가 낮게 위치한 골반 라인을 가려주어 다리를 훨씬 더 길고 슬림해 보이게 만듭니다.',
            lovely: '추천 이유: 상체 골격이 얇고 부드러운 유선형의 여성 웨이브 체형에 가장 잘 어울리는 화려한 디테일의 룩입니다. 입체적인 퍼프 소매와 리본 디테일이 더해진 그레이 셔츠 블라우스에 아기자기한 리본 셔링이 들어간 블랙 미니 스커트를 매치하여 웨이브 체형 특유의 발랄함과 사랑스러운 무드를 극대화했습니다.\n\n체형 보완/강조 포인트: 둥글고 큰 카라와 소매 볼륨, 가슴 라인의 셔링이 빈약해 보일 수 있는 상체에 풍성한 볼륨감을 채워줍니다. 또한, 가슴 아래에서 허리선을 한번 잡아주는 하이웨이스트 실루엣의 블라우스와 A라인으로 펼쳐지는 플레어 스커트가 낮아 보일 수 있는 허리 위치를 높여주어 전체적인 비율을 완벽하게 보완합니다.',
            street: '추천 이유: 상체 골격이 가늘고 아래로 처지기 쉬워 오버핏이 겉돌 수 있는 여성 웨이브 체형의 특징을 고려해, 어깨와 가슴 라인이 적당히 맞는 차콜 그래픽 티셔츠와 빈티지한 카모플라쥬 패턴의 카고 팬츠를 매치해 힙하면서도 트렌디한 스트릿 룩을 완성했습니다.\n\n체형 보완/강조 포인트: 상의 전면에 들어간 큼직하고 입체적인 그래픽 디자인이 가늘고 긴 상체에 볼륨감을 더해 시선을 위로 끌어올려 줍니다. 또한, 높은 허리선으로 착용할 수 있는 하이라이즈 형태의 와이드 카고 팬츠가 웨이브 체형 특유의 낮은 골반 위치를 자연스럽게 커버하고, 포켓 디테일이 하체의 밋밋함을 보완해 다리를 한층 길어 보이게 만듭니다.',
        },
    },
};

/* ── 유틸 ── */
function dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const CONNECTIONS = [
    [11, 12],
    [11, 13],
    [13, 15],
    [12, 14],
    [14, 16],
    [11, 23],
    [12, 24],
    [23, 24],
    [23, 25],
    [25, 27],
    [24, 26],
    [26, 28],
];

const KEY_POINTS = new Set([11, 12, 23, 24]);

/* ── 바운딩박스 크롭 + 랜드마크 그리기 ── */
function buildPersonCanvas(img, landmarks) {
    const W = img.naturalWidth;
    const H = img.naturalHeight;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const lm of landmarks) {
        if (!lm) continue;

        if (lm.x < minX) minX = lm.x;
        if (lm.y < minY) minY = lm.y;
        if (lm.x > maxX) maxX = lm.x;
        if (lm.y > maxY) maxY = lm.y;
    }

    if (minX === Infinity) return null;

    const padX = (maxX - minX) * 0.15;
    const padY = (maxY - minY) * 0.15;

    minX = Math.max(0, minX - padX);
    minY = Math.max(0, minY - padY);
    maxX = Math.min(1, maxX + padX);
    maxY = Math.min(1, maxY + padY);

    const cropX = minX * W;
    const cropY = minY * H;
    const cropW = (maxX - minX) * W;
    const cropH = (maxY - minY) * H;

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;

    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    ctx.strokeStyle = 'rgba(0,255,80,0.9)';
    ctx.lineWidth = Math.max(2, cropW * 0.005);

    for (const [a, b] of CONNECTIONS) {
        const la = landmarks[a];
        const lb = landmarks[b];

        if (!la || !lb) continue;

        ctx.beginPath();
        ctx.moveTo(la.x * W - cropX, la.y * H - cropY);
        ctx.lineTo(lb.x * W - cropX, lb.y * H - cropY);
        ctx.stroke();
    }

    for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i];

        if (!lm) continue;

        const lx = lm.x * W - cropX;
        const ly = lm.y * H - cropY;

        ctx.fillStyle = KEY_POINTS.has(i) ? 'rgba(255,40,40,0.95)' : 'rgba(0,210,255,0.85)';

        ctx.beginPath();
        ctx.arc(lx, ly, KEY_POINTS.has(i) ? cropW * 0.013 : cropW * 0.008, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvas.toDataURL('image/jpeg', 0.92);
}

/* ── 측정선 + 수치 오버레이 이미지 ── */
function buildMeasureCanvas(img, landmarks) {
    const W = img.naturalWidth;
    const H = img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    if (!landmarks) {
        return {
            url: canvas.toDataURL('image/jpeg', 0.92),
            metrics: null,
        };
    }

    const ls = landmarks[11];
    const rs = landmarks[12];
    const lh = landmarks[23];
    const rh = landmarks[24];

    if (!ls || !rs || !lh || !rh) {
        return {
            url: canvas.toDataURL('image/jpeg', 0.92),
            metrics: null,
        };
    }

    const shoulderW = dist(ls, rs);
    const hipW = dist(lh, rh);
    const shr = shoulderW / hipW;

    ctx.setLineDash([10, 7]);
    ctx.strokeStyle = 'rgba(255,230,0,1)';
    ctx.lineWidth = Math.max(2, W * 0.005);
    ctx.beginPath();
    ctx.moveTo(ls.x * W, ls.y * H);
    ctx.lineTo(rs.x * W, rs.y * H);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,100,200,1)';
    ctx.beginPath();
    ctx.moveTo(lh.x * W, lh.y * H);
    ctx.lineTo(rh.x * W, rh.y * H);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = 'rgba(160,160,255,0.6)';
    ctx.lineWidth = Math.max(1, W * 0.003);

    const midShX = ((ls.x + rs.x) / 2) * W;

    ctx.beginPath();
    ctx.moveTo(midShX, ls.y * H);
    ctx.lineTo(midShX, lh.y * H);
    ctx.stroke();

    let bodyRatio = null;

    const la = landmarks[27];
    const ra = landmarks[28];

    if (la && ra) {
        const shoulderY = (ls.y + rs.y) / 2;
        const hipY = (lh.y + rh.y) / 2;
        const ankleY = (la.y + ra.y) / 2;

        const upper = hipY - shoulderY;
        const lower = ankleY - hipY;

        if (lower > 0.01) bodyRatio = upper / lower;

        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = Math.max(1, W * 0.003);
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(0, hipY * H);
        ctx.lineTo(W, hipY * H);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 3;

    const lines = [
        `SHR (어깨/힙): ${shr.toFixed(3)}`,
        `어깨 너비: ${(shoulderW * 100).toFixed(1)}%`,
        `힙 너비:   ${(hipW * 100).toFixed(1)}%`,
    ];

    if (bodyRatio !== null) {
        lines.push(`상/하체 비율: ${bodyRatio.toFixed(3)}`);
    }

    const lh2 = Math.max(20, H * 0.033);
    const panelW = Math.max(230, W * 0.42);
    const panelH = lines.length * lh2 + 18;
    const px = W - panelW - 10;
    const py = 10;

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.beginPath();
    ctx.roundRect(px, py, panelW, panelH, 7);
    ctx.fill();

    ctx.font = `bold ${Math.max(11, lh2 * 0.68)}px monospace`;
    ctx.fillStyle = '#00e676';

    lines.forEach((line, i) => {
        ctx.fillText(line, px + 10, py + 12 + lh2 * (i + 0.75));
    });

    const fs = Math.max(12, W * 0.026);

    ctx.font = `bold ${fs}px sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 4;

    ctx.fillStyle = 'rgba(255,230,0,1)';
    ctx.fillText('← 어깨 →', ls.x * W + 6, ls.y * H - 8);

    ctx.fillStyle = 'rgba(255,100,200,1)';
    ctx.fillText('← 힙 →', lh.x * W + 6, lh.y * H + fs + 4);

    ctx.shadowBlur = 0;

    return {
        url: canvas.toDataURL('image/jpeg', 0.92),
        metrics: {
            shr,
            shoulderW,
            hipW,
            bodyRatio,
        },
    };
}

/* ── 컴포넌트 ── */
function ResultPage2() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [selectedOutfit, setSelectedOutfit] = useState(null);
    const [personImgUrl, setPersonImgUrl] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [processing, setProcessing] = useState(false);

    const gender = state?.gender || state?.analysis?.gender || 'female';
    const bodyType = state?.bodyType || state?.analysis?.bodyType || 'natural';
    const photo = state?.image;

    const bodyTypeText = bodyTypeLabels[bodyType] || bodyType;
    const bodyComment = bodyComments[gender]?.[bodyType] || bodyComments.female.natural;
    const currentImages = outfitImages[gender]?.[bodyType] || {};

    const otherOutfits = Object.entries(currentImages).map(([styleId, image]) => ({
        id: styleId,
        title: styleLabels[styleId] || styleId,
        image,
        desc: styleDescriptions[gender]?.[bodyType]?.[styleId] || '해당 체형과 스타일에 맞는 추천 코디입니다.',
    }));

    useEffect(() => {
        if (!photo) return;
        runMediaPipe(photo);
    }, [photo]);

    async function runMediaPipe(photoDataUrl) {
        setProcessing(true);

        try {
            const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
            );

            const landmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task',
                    delegate: 'GPU',
                },
                runningMode: 'IMAGE',
                numPoses: 1,
            });

            const img = new Image();
            img.src = photoDataUrl;

            await new Promise((res, rej) => {
                img.onload = res;
                img.onerror = rej;
            });

            const lmResult = landmarker.detect(img);
            const landmarks = lmResult.landmarks?.[0] ?? null;

            landmarker.close();

            if (landmarks) {
                setPersonImgUrl(buildPersonCanvas(img, landmarks));
            }

            const { metrics: m } = buildMeasureCanvas(img, landmarks);
            setMetrics(m);
        } catch (err) {
            console.error('MediaPipe 처리 실패:', err);
        } finally {
            setProcessing(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-emerald-200 via-violet-100 to-cyan-100 px-6 py-6 flex items-center justify-center">
            <div className="w-full max-w-[1320px] rounded-[28px] bg-white/65 backdrop-blur-md shadow-2xl p-6">
                <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-7">
                    체형 분석 기반 코디 추천 결과
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-[2.7fr_1.45fr] gap-5">
                    {/* ── 왼쪽: BODY MAP ── */}
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-100/80 to-cyan-100/70 shadow-md p-6 min-h-[560px]">
                        <div className="flex gap-7 h-full items-stretch">
                            {/* 이미지 컬럼 */}
                            <div className="flex flex-col items-center justify-center gap-3 self-stretch">
                                {/* 크롭된 사람 + 랜드마크 이미지 */}
                                <div className="w-[285px] h-[470px] rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-gray-800">
                                    {processing && !personImgUrl ? (
                                        <p className="text-gray-400 text-sm">분석 중...</p>
                                    ) : personImgUrl ? (
                                        <img
                                            src={personImgUrl}
                                            alt="랜드마크"
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <p className="text-gray-500 text-sm">사진 없음</p>
                                    )}
                                </div>

                                {/* 수치 요약 박스 */}
                                <div className="w-[285px] rounded-xl bg-black/70 p-3 text-xs font-mono text-green-400 space-y-1">
                                    <div>
                                        SHR:{' '}
                                        <span className="text-yellow-300">
                                            {metrics ? metrics.shr.toFixed(3) : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        어깨:{' '}
                                        <span className="text-yellow-300">
                                            {metrics ? `${(metrics.shoulderW * 100).toFixed(1)}%` : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        힙:{' '}
                                        <span className="text-pink-300">
                                            {metrics ? `${(metrics.hipW * 100).toFixed(1)}%` : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        상/하체:{' '}
                                        <span className="text-cyan-300">
                                            {metrics?.bodyRatio != null ? metrics.bodyRatio.toFixed(3) : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 텍스트 분석 */}
                            <div className="flex-1 pt-6">
                                {processing ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4">
                                        <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-gray-500 font-semibold">체형 분석 중...</p>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 leading-snug">
                                            당신의 Body 타입은
                                            <br />
                                            <span className="text-purple-600">{bodyTypeText}</span>입니다
                                        </h2>

                                        <div className="space-y-5 text-gray-900">
                                            <section className="rounded-2xl bg-white/55 p-4 shadow-sm">
                                                <h3 className="text-xl font-extrabold mb-2">숄더 라인 및 상체 분석:</h3>
                                                <p className="text-base leading-relaxed font-semibold">
                                                    {bodyComment.shoulder}
                                                </p>
                                            </section>

                                            <section className="rounded-2xl bg-white/55 p-4 shadow-sm">
                                                <h3 className="text-xl font-extrabold mb-2">하체 및 비율 분석:</h3>
                                                <p className="text-base leading-relaxed font-semibold">{bodyComment.lower}</p>
                                            </section>

                                            <section className="rounded-2xl bg-white/55 p-4 shadow-sm">
                                                <h3 className="text-xl font-extrabold mb-2">코디네이션 전략:</h3>
                                                <p className="text-base leading-relaxed font-semibold">
                                                    {bodyComment.styling}
                                                </p>
                                            </section>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── 오른쪽: OTHER STYLES ── */}
                    <div className="relative rounded-2xl bg-gradient-to-br from-violet-100/80 to-emerald-100/70 shadow-md p-4 min-h-[560px] overflow-hidden">
                        <h2 className="text-lg font-extrabold text-center text-gray-900 mb-4">STYLES</h2>

                        {!selectedOutfit ? (
                            <div className="flex flex-col gap-4 transition-all duration-500">
                                {otherOutfits.length > 0 ? (
                                    otherOutfits.map((set) => (
                                        <button
                                            key={set.id}
                                            onClick={() => setSelectedOutfit(set)}
                                            className="rounded-2xl bg-white/70 shadow-md p-3 hover:scale-[1.03] transition duration-300 text-left"
                                        >
                                            <h3 className="text-center text-sm font-extrabold text-gray-900 mb-2">
                                                [{set.title}]
                                            </h3>

                                            <div className="h-[125px] rounded-xl bg-white/80 flex items-center justify-center overflow-hidden shadow-inner">
                                                <img
                                                    src={set.image}
                                                    alt={set.title}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 font-bold mt-10">
                                        다른 스타일 이미지가 없습니다.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="animate-[scaleIn_0.45s_ease-out] rounded-2xl bg-white/90 shadow-xl p-4 min-h-[500px] flex flex-col">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-base font-extrabold text-gray-900">[{selectedOutfit.title}]</h3>

                                    <button
                                        onClick={() => setSelectedOutfit(null)}
                                        className="w-8 h-8 rounded-full bg-gray-200 text-xl font-extrabold hover:bg-gray-300"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="h-[210px] rounded-2xl bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center overflow-hidden shadow-inner mb-4">
                                    <img
                                        src={selectedOutfit.image}
                                        alt={selectedOutfit.title}
                                        className="h-full w-full object-contain"
                                    />
                                </div>

                                <div className="flex-1 rounded-2xl bg-gradient-to-br from-emerald-100/80 to-violet-100/80 p-4">
                                    <h4 className="text-lg font-extrabold text-gray-900 mb-3">스타일 설명</h4>

                                    <p className="text-base leading-relaxed font-semibold text-gray-800 whitespace-pre-line">
                                        {selectedOutfit.desc}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-5">
                                        <span className="px-3 py-1 rounded-full bg-white/80 text-purple-600 font-bold">
                                            #체형보완
                                        </span>

                                        <span className="px-3 py-1 rounded-full bg-white/80 text-purple-600 font-bold">
                                            #비율보정
                                        </span>

                                        <span className="px-3 py-1 rounded-full bg-white/80 text-purple-600 font-bold">
                                            #추천코디
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <style>{`
                    @keyframes scaleIn {
                        0%   { opacity: 0; transform: scale(0.85) translateY(20px); }
                        100% { opacity: 1; transform: scale(1) translateY(0); }
                    }
                `}</style>

                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="w-[300px] h-14 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 text-white text-xl font-extrabold shadow-lg hover:scale-105 transition"
                    >
                        ← 처음으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResultPage2;
