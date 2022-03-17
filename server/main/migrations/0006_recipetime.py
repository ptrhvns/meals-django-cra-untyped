# Generated by Django 4.0.2 on 2022-03-09 21:10

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_recipe'),
    ]

    operations = [
        migrations.CreateModel(
            name='RecipeTime',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('days', models.PositiveIntegerField(blank=True, null=True)),
                ('hours', models.PositiveIntegerField(blank=True, null=True)),
                ('minutes', models.PositiveIntegerField(blank=True, null=True)),
                ('time_type', models.CharField(choices=[('additional', 'Additional'), ('cook', 'Cook'), ('preparation', 'Preparation')], max_length=20)),
                ('recipe', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recipe_times', to='main.recipe')),
            ],
        ),
    ]