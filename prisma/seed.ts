import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL ? (process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'connection_limit=1') : undefined
    }
  }
});

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data
  await prisma.activityLog.deleteMany({});
  await prisma.reference.deleteMany({});
  await prisma.fatwa.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.wazifa.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.subCategory.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.mufti.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Categories & Subcategories
  const categoriesData = [
    {
      nameEn: "Aqeedah (Beliefs)",
      nameUr: "عقائد",
      subCategories: [
        { nameEn: "Divine Entity and Attributes", nameUr: "ذات و صفات باری تعالیٰ" },
        { nameEn: "Prophethood and Messengership", nameUr: "نبوت و رسالت" },
        { nameEn: "Speech of Allah", nameUr: "کلام اللہ تعالیٰ" },
        { nameEn: "Companions of the Prophet", nameUr: "صحابہ کرام" },
        { nameEn: "Saints of Allah", nameUr: "اولیائے کرام" },
        { nameEn: "Scholars of Islam", nameUr: "علمائے کرام" },
        { nameEn: "Emulation of Imams (Taqleed)", nameUr: "تقلید ائمہ" },
        { nameEn: "Allegiance and Spiritual Guidance", nameUr: "بیعت و ارشاد" },
        { nameEn: "Hereafter and Resurrection", nameUr: "معاد و حشر" },
        { nameEn: "Jinn and Angels", nameUr: "جن و ملائک" },
        { nameEn: "Faith and Disbelief", nameUr: "ایمان و کفر" },
        { nameEn: "Deviant Sects", nameUr: "فرق باطلہ" },
        { nameEn: "Words of Disbelief", nameUr: "الفاظ کفر" },
        { nameEn: "Others", nameUr: "دیگر" }
      ]
    },
    {
      nameEn: "Taharah (Purity)",
      nameUr: "طہارت",
      subCategories: [
        { nameEn: "Wudu (Ablution)", nameUr: "وضو" },
        { nameEn: "Ghusl (Ritual Bath)", nameUr: "غسل" },
        { nameEn: "Purity and Impurity", nameUr: "پاکی و ناپاکی" }
      ]
    },
    {
      nameEn: "Salah (Prayer)",
      nameUr: "نماز",
      subCategories: [
        { nameEn: "Prayer Timings", nameUr: "اوقاتِ نماز" },
        { nameEn: "Adhan (Call to Prayer)", nameUr: "اذان" },
        { nameEn: "Method of Prayer (Sifat-us-Salah)", nameUr: "صفۃ الصلوٰۃ" },
        { nameEn: "Qira'at (Recitation)", nameUr: "قرأت" },
        { nameEn: "Congregation (Jama'at)", nameUr: "جماعت" },
        { nameEn: "Imamat (Leading Prayer)", nameUr: "امامت" },
        { nameEn: "Witr and Voluntary Prayers", nameUr: "وتر ونوافل" },
        { nameEn: "Friday and Eid Prayers", nameUr: "جمعہ وعیدین" },
        { nameEn: "Rulings of Mosques", nameUr: "احکام مساجد" },
        { nameEn: "Janaiz (Funerals)", nameUr: "جنائز" }
      ]
    },
    {
      nameEn: "Zakat (Almsgiving)",
      nameUr: "زکوٰۃ",
      subCategories: [
        { nameEn: "Expenditure of Zakat", nameUr: "مصرف زکوٰۃ" },
        { nameEn: "Eligible for Zakat", nameUr: "مستحق زکوٰۃ" },
        { nameEn: "Method of Zakat", nameUr: "طریقہ زکوٰۃ" }
      ]
    },
    {
      nameEn: "Sawm (Fasting)",
      nameUr: "روزہ",
      subCategories: [
        { nameEn: "Moon Sighting (Ru'yat-e-Hilal)", nameUr: "رویت ہلال" },
        { nameEn: "Fasting (Sawm)", nameUr: "روزہ" },
        { nameEn: "I'tikaf (Seclusion)", nameUr: "اعتکاف" }
      ]
    },
    {
      nameEn: "Hajj (Pilgrimage)",
      nameUr: "حج",
      subCategories: [
        { nameEn: "Days of Hajj", nameUr: "ایام حج" },
        { nameEn: "Method of Hajj", nameUr: "طریقہ حج" },
        { nameEn: "Rituals of Hajj", nameUr: "مناسک حج" }
      ]
    },
    {
      nameEn: "Nikah (Marriage)",
      nameUr: "نکاح",
      subCategories: [
        { nameEn: "Prohibited Relations (Muharramat)", nameUr: "محرمات" },
        { nameEn: "Mehr (Dower)", nameUr: "مہر" },
        { nameEn: "Kafa'at (Compatibility)", nameUr: "کفاءت" },
        { nameEn: "Agency and Guardianship", nameUr: "وکالت وولایت" },
        { nameEn: "Jahez (Dowry)", nameUr: "جہیز" },
        { nameEn: "Others", nameUr: "دیگر" }
      ]
    },
    {
      nameEn: "Talaq (Divorce)",
      nameUr: "طلاق",
      subCategories: [
        { nameEn: "Divorce (Talaq)", nameUr: "طلاق" },
        { nameEn: "Kinayah (Allusional Divorce)", nameUr: "کنایۃ" },
        { nameEn: "Missing Person (Mafqood-ul-Khabar)", nameUr: "مفقود الخبر" },
        { nameEn: "Faskh (Annulment of Marriage)", nameUr: "فسخ" },
        { nameEn: "Iddah (Waiting Period)", nameUr: "عدت" },
        { nameEn: "Nafaqa (Maintenance)", nameUr: "نفقہ" },
        { nameEn: "Nasab (Paternity and Lineage)", nameUr: "نسب" },
        { nameEn: "Hudood (Legal Punishments)", nameUr: "حدود" }
      ]
    },
    {
      nameEn: "Bay' (Business & Finance)",
      nameUr: "بیع",
      subCategories: [
        { nameEn: "Buying and Selling (Bay')", nameUr: "بیع" },
        { nameEn: "Riba (Usury & Interest)", nameUr: "ربا" },
        { nameEn: "Ijarah (Lease & Hire)", nameUr: "اجارہ" },
        { nameEn: "Waqf (Endowment)", nameUr: "وقف" }
      ]
    },
    {
      nameEn: "Qurbani (Sacrifice)",
      nameUr: "قربانی",
      subCategories: [
        { nameEn: "Qurbani (Sacrifice)", nameUr: "قربانی" },
        { nameEn: "Zabaih (Slaughtering)", nameUr: "ذبائح" },
        { nameEn: "Distribution of Meat", nameUr: "تقسیم اللحم" },
        { nameEn: "Others", nameUr: "دیگر" }
      ]
    },
    {
      nameEn: "Hazr-o-Ibaha (Prohibitions & Permissibilities)",
      nameUr: "حظر واباحۃ",
      subCategories: [
        { nameEn: "Qiblah and Recitation etc.", nameUr: "قبلہ وتلاوت وغیرہا" },
        { nameEn: "Taqwa and Taharah", nameUr: "تقویٰ وطہارت" },
        { nameEn: "Knowledge and Education", nameUr: "علم وتعلیم" },
        { nameEn: "Gatherings, Mawlid and Urs", nameUr: "مجالس ومیلاد و اعراس" },
        { nameEn: "Funerals, Mourning and Lamentation", nameUr: "جنائز ونوحہ، جزع وفزع" },
        { nameEn: "Esal-e-Sawab and Fatiha", nameUr: "ایصال ثواب وفاتحہ" },
        { nameEn: "Musical Instruments and Amusements", nameUr: "مزامیر، لہو ولعب" },
        { nameEn: "Kasb (Livelihood & Earnings)", nameUr: "کسب" },
        { nameEn: "Lihyah (Beard) and Haircut", nameUr: "لحیہ وحجامت" },
        { nameEn: "Dress and Veil (Libas & Hijab)", nameUr: "لباس وحجاب" },
        { nameEn: "Salutation and Handshake", nameUr: "سلام ومصافحہ" },
        { nameEn: "Eating, Drinking and Feasting", nameUr: "اکل وشرب، دعوت وضیافت" },
        { nameEn: "Utensils and Adornment", nameUr: "ظروف وزینت" },
        { nameEn: "Society & Social Life", nameUr: "معاشرہ" },
        { nameEn: "Lying and Backbiting", nameUr: "جھوٹ اور غیبت" },
        { nameEn: "Animals", nameUr: "جانور" },
        { nameEn: "Pictures and Photography", nameUr: "تصاویر" },
        { nameEn: "Customs and Common Practices", nameUr: "رسومات ومروجات" },
        { nameEn: "Miscellaneous", nameUr: "متفرقات" }
      ]
    },
    {
      nameEn: "Inheritance (Meerath)",
      nameUr: "میراث",
      subCategories: [
        { nameEn: "Heirs (Wariseen)", nameUr: "وارثین" },
        { nameEn: "Inheritance Laws (Wirasath)", nameUr: "وراثت" },
        { nameEn: "Others", nameUr: "دیگر" }
      ]
    },
    {
      nameEn: "Seerah and History",
      nameUr: "سیر و تواریخ",
      subCategories: [
        { nameEn: "Others", nameUr: "دیگر" }
      ]
    }
  ];

  const categoriesMap: { [key: string]: { id: string; subCategories: { [subKey: string]: string } } } = {};

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        nameEn: cat.nameEn,
        nameUr: cat.nameUr,
        isActive: true
      }
    });

    const subMap: { [subKey: string]: string } = {};
    for (const sub of cat.subCategories) {
      const createdSub = await prisma.subCategory.create({
        data: {
          categoryId: createdCat.id,
          nameEn: sub.nameEn,
          nameUr: sub.nameUr,
          isActive: true
        }
      });
      subMap[sub.nameEn] = createdSub.id;
    }

    categoriesMap[cat.nameEn] = {
      id: createdCat.id,
      subCategories: subMap
    };
  }
  console.log('Categories seeded.');

  // 3. Create Admin & Mufti Users
  const adminPassword = await bcrypt.hash('adminpassword', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@darulifta.org',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN'
    }
  });

  const muftiPassword = await bcrypt.hash('muftipassword', 10);
  const muftiUser = await prisma.user.create({
    data: {
      email: 'mufti@darulifta.org',
      passwordHash: muftiPassword,
      role: 'MUFTI'
    }
  });

  const muftiProfile = await prisma.mufti.create({
    data: {
      userId: muftiUser.id,
      nameEn: 'Mufti Muhammad Salman Raza',
      nameUr: 'مفتی محمد سلمان رضا',
      employeeId: 'MDI-001',
      designation: 'Senior Mufti',
      joiningDate: new Date('2020-01-01'),
      status: 'ACTIVE',
      photoUrl: null,
      bio: 'Alim and Mufti graduated from Jamia Razvia, Bareilly Shareef. Specialized in Fiqh Hanafi and Islamic Jurisprudence.',
      qualification: 'Darse Nizami, Ifta course',
      specialization: 'Fiqh Hanafi (Islamic Jurisprudence)',
      mobile: '+919876543210'
    }
  });

  console.log('Users & Mufti profiles seeded.');

  // 4. Create Sample Questions & Fatwas
  const sampleQuestion = await prisma.question.create({
    data: {
      trackingNumber: 'MDI-2026-0001',
      name: 'Abdul Rehman',
      phone: '+919999999999',
      email: 'abdul@example.com',
      city: 'Delhi',
      questionText: 'Is it permissible to perform Salah while wearing a digital smartwatch that shows prayer times and notifications?',
      status: 'ANSWERED'
    }
  });

  const sampleFatwa = await prisma.fatwa.create({
    data: {
      fatwaNumber: '1447-000001',
      questionId: sampleQuestion.id,
      answeredById: muftiProfile.id,
      titleEn: 'Salah Wearing Smartwatch',
      titleUr: 'سمارٹ واچ پہن کر نماز پڑھنا',
      answerEn: 'Yes, it is completely permissible to perform Salah while wearing a smartwatch. Showing notifications or digital screen does not invalidate the prayer as long as it does not distract the worshipper or play musical ringtones.',
      answerUr: 'جی ہاں، سمارٹ واچ پہن کر نماز پڑھنا بلا کراہت جائز ہے۔ سمارٹ واچ پر وقت کا دیکھنا یا نوٹیفیکیشنز کا ظاہر ہونا نماز کو فاسد نہیں کرتا، بشرطیکہ وہ نمازی کی توجہ نہ ہٹائے اور اس میں میوزیکل رنگ ٹونز نہ بجیں۔ واللہ اعلم بالصواب۔',
      categoryId: categoriesMap['Salah (Prayer)'].id,
      subCategoryId: categoriesMap['Salah (Prayer)'].subCategories['Method of Prayer (Sifat-us-Salah)'],
      visibility: 'PUBLIC',
      publishedAt: new Date(),
      views: 45
    }
  });

  // Create Reference
  await prisma.reference.create({
    data: {
      fatwaId: sampleFatwa.id,
      type: 'BOOK',
      bookTitle: 'Fatawa Ridwiyyah',
      volume: '6',
      page: '124',
      text: 'نماز کی صحت کے لیے لباس اور بدن کا پاک ہونا ضروری ہے اور ایسی کوئی بھی چیز جس میں کوئی شرعی خرابی نہ ہو، پہن کر نماز پڑھنا جائز ہے۔'
    }
  });

  console.log('Sample Fatwas and References seeded.');

  // 5. Create Wazaif
  await prisma.wazifa.create({
    data: {
      title: 'Wazifa for Rizq and Prosperity',
      arabicText: 'يَا رَزَّاقُ كُلِّ مَخْلُوقٍ وَرَاحِمَهُ وَيَا رَزَّاقُ',
      translationUr: 'اے ہر مخلوق کو روزی دینے والے اور اس پر رحم کرنے والے، اے بہت زیادہ رزق دینے والے۔',
      translationEn: 'O Provider of sustenance for every creation and Bestower of mercy, O All-Provider.',
      benefits: 'Recitation increases barakah in wealth, solves financial difficulties, and opens new paths of livelihood.',
      method: 'Recite 111 times after Fajar Salah daily with Durood Shareef 11 times before and after.',
      references: 'Wazaif of Dargah Aala Hazrat',
      category: 'Rizq (Sustenance)'
    }
  });

  await prisma.wazifa.create({
    data: {
      title: 'Wazifa for Relief from Anxiety and Stress',
      arabicText: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
      translationUr: 'اللہ ہمارے لیے کافی ہے اور وہ بہترین کارساز ہے۔',
      translationEn: 'Sufficient for us is Allah, and [He is] the best Disposer of affairs.',
      benefits: 'Helps in overcoming fear, anxiety, depression, and severe difficulties.',
      method: 'Recite 313 times daily at any time in a state of Wudu.',
      references: 'Surah Ali Imran, Ayat 173',
      category: 'Peace of Mind'
    }
  });

  console.log('Sample Wazaif seeded.');

  // 6. Create Books
  await prisma.book.create({
    data: {
      title: 'Fatawa Razviya (فتاویٰ رضویہ)',
      coverUrl: null,
      downloadUrl: '#',
      category: 'Fatwa',
      publishedDate: new Date('1900-01-01'),
      type: 'BOOK',
      description: 'The monumental Islamic jurisprudential work of Ala Hazrat Imam Ahmad Raza Khan Al-Qadri.'
    }
  });

  await prisma.book.create({
    data: {
      title: 'Al-Motaqad (المعتقد)',
      coverUrl: null,
      downloadUrl: '#',
      category: 'Aqeedah',
      publishedDate: new Date('1902-01-01'),
      type: 'BOOK',
      description: 'Important treatise on theological doctrines and rulings by Ala Hazrat.'
    }
  });

  await prisma.book.create({
    data: {
      title: 'Monthly Sunnu Duniya (ماہنامہ سنی دنیا)',
      coverUrl: null,
      downloadUrl: '#',
      category: 'Magazine',
      publishedDate: new Date('2026-06-01'),
      type: 'MAGAZINE',
      description: 'The official monthly research magazine containing contemporary articles and scholarly fatwa publications.'
    }
  });

  await prisma.book.create({
    data: {
      title: 'Fatawa Mustafviyah (فتاویٰ مصطفویہ)',
      coverUrl: null,
      downloadUrl: '#',
      category: 'Fatwa',
      publishedDate: new Date('1980-01-01'),
      type: 'BOOK',
      description: 'Collection of Islamic rulings and fatwas by Huzoor Mufti-e-Azam Hind, Mufti Mustafa Raza Khan Al-Qadri.'
    }
  });

  await prisma.book.create({
    data: {
      title: 'Fatawa Tajushshariah (فتاویٰ تاج الشریعہ)',
      coverUrl: null,
      downloadUrl: '#',
      category: 'Fatwa',
      publishedDate: new Date('2010-01-01'),
      type: 'BOOK',
      description: 'Collection of contemporary rulings and legal answers issued by Huzoor Tajush Shariah, Mufti Muhammad Akhtar Raza Khan Azhari.'
    }
  });

  console.log('Sample Books & Magazines seeded.');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
