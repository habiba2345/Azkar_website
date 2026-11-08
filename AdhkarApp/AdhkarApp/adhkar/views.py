from django.db.models import Q
from rest_framework import generics, mixins
from rest_framework.filters import SearchFilter
from rest_framework.exceptions import ValidationError
from .serializer import *
from .models import *
from .permissions import ReadOnlyOrAdmin, AdhkarPermission


def visible_adhkar_queryset(user):
    """
    أذكار الأقسام الرسمية (owner فاضي) بتبان للكل. أما أذكار "ذكر حر" (اللي
    ليها owner) فبتبان لصاحبها بس، مش لكل الزوار/المستخدمين.
    """
    base = Adhkar.objects.all()
    if user and user.is_authenticated:
        return base.filter(Q(owner__isnull=True) | Q(owner=user))
    return base.filter(owner__isnull=True)


def get_or_create_free_category():
    """
    قسم "ذكر حر" الثابت اللي بيروح له أي ذكر يضيفه مستخدم عادي بنفسه.
    بيتعمل تلقائيًا لو مش موجود أصلًا (مش محتاج تضيفه يدوي من الأدمن).
    """
    category, _ = Category.objects.get_or_create(
        name=FREE_CATEGORY_NAME,
        defaults={'description': 'اكتب أذكارك الخاصة، وهتظهر هنا لكل زوار الموقع'},
    )
    return category


class ListCreateAdhkar(generics.ListCreateAPIView):
    serializer_class = AdhkarSerializer
    filter_backends = [SearchFilter]
    search_fields = ['title', 'category__name']
    permission_classes = [AdhkarPermission]

    def get_queryset(self):
        return visible_adhkar_queryset(self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_staff:
            # الأدمن ممكن يضيف ذكر في أي قسم، وملوش "مالك" لأنه ذكر رسمي.
            # لازم يختار قسم في الحالة دي (category بقت اختيارية في السيريالايزر
            # عشان المستخدم العادي، فبنتأكد هنا إن الأدمن بعتها).
            if not serializer.validated_data.get('category'):
                raise ValidationError({'category': 'لازم تختار قسم للذكر ده.'})
            serializer.save()
        else:
            # المستخدم العادي: الذكر بتاعه بيروح لقسم "ذكر حر" دايمًا، وهو المالك
            serializer.save(category=get_or_create_free_category(), owner=user)


class GetUpdateDeleteAdhkar(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdhkarSerializer
    permission_classes = [AdhkarPermission]

    def get_queryset(self):
        return visible_adhkar_queryset(self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_update(self, serializer):
        user = self.request.user
        if user.is_staff:
            serializer.save()
        else:
            # المستخدم العادي يقدر يعدل عنوان/محتوى/نقاط الذكر بتاعه بس،
            # ومايقدرش يغيّر القسم أو ينقل الملكية لحد تاني
            serializer.save(category=get_or_create_free_category(), owner=serializer.instance.owner)


class ListCreateCategory(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [SearchFilter]
    search_fields = ['name']
    permission_classes = [ReadOnlyOrAdmin]


class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [ReadOnlyOrAdmin]
