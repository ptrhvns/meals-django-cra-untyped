import smtplib

import pytest
from django.conf import settings

from main import models, tasks
from main.tests import factories

user_id = 777
site_uri = "http://example.com/"
confirmation_uri = f"{site_uri}/signup-confirmation/exampletoken/"


def test_task_dispatches_logic(mocker):
    mock = mocker.patch("main.tasks._send_signup_confirmation")
    tasks.send_signup_confirmation(user_id, site_uri, confirmation_uri)
    mock.assert_called_with(user_id, site_uri, confirmation_uri)


@pytest.mark.django_db
def test_emailing_user(mocker):
    mock = mocker.patch("main.tasks.models.User.email_user")
    user = factories.UserFactory.create()
    tasks._send_signup_confirmation(user.id, site_uri, confirmation_uri)
    assert mock.called
    assert isinstance(mock.call_args.args[0], str)
    assert len(mock.call_args.args[0]) > 0
    assert isinstance(mock.call_args.args[1], str)
    assert len(mock.call_args.args[1]) > 0
    assert mock.call_args.kwargs["fail_silently"] is False
    assert mock.call_args.kwargs["from_email"] == settings.EMAIL_ADDRESSES["support"]
    assert isinstance(mock.call_args.kwargs["html_message"], str)
    assert len(mock.call_args.kwargs["html_message"]) > 0


@pytest.mark.django_db
def test_user_does_not_exist(mocker):
    get_mock = mocker.patch("main.tasks.models.User.objects.get")
    get_mock.side_effect = models.User.DoesNotExist()
    error_mock = mocker.patch("main.tasks.logger.error")
    tasks._send_signup_confirmation(user_id, site_uri, confirmation_uri)
    assert get_mock.called
    assert error_mock.called
    assert len(error_mock.call_args.args[0]) > 0


@pytest.mark.django_db
def test_email_delivery_fails(mocker):
    email_user_mock = mocker.patch("main.tasks.models.User.email_user")
    email_user_mock.side_effect = smtplib.SMTPException()
    error_mock = mocker.patch("main.tasks.logger.error")
    user = factories.UserFactory.create()
    tasks._send_signup_confirmation(user.id, site_uri, confirmation_uri)
    assert email_user_mock.called
    assert error_mock.called
    assert len(error_mock.call_args.args[0]) > 0
