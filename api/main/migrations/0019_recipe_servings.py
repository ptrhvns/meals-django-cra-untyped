# Generated by Django 4.0.3 on 2022-06-23 19:15

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0018_alter_recipetag_name_alter_recipetag_unique_together'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipe',
            name='servings',
            field=models.PositiveSmallIntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0)]),
        ),
    ]
